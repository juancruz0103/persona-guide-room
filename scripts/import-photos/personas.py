#!/usr/bin/env python3
"""
Pasa las fotos de Personas de Juan (capturas del compendio) a WebP para la página.

Uso: python3 -I personas.py "<carpeta Persona fotos>" <game-text.json> <personas.json> <party.json> <salida>

- Cada carpeta lleva el nombre oficial en español; los archivos terminan en -de (ficha) o -iz (calculadora).
- Se quitan solos la franja blanca del menú (arriba), los botones (abajo) y bordes blancos.
- recortes.json: recorte a mano para las fotos que quedan descuadradas.
- Salida: <salida>/<id>-de.webp y <id>-iz.webp (id interno de la Persona).
"""
import json, os, sys, unicodedata
from PIL import Image

def norm(s):
    return unicodedata.normalize('NFD', s.lower()).encode('ascii', 'ignore').decode().replace('è', 'e').strip()

def bright_ratio(im, box):
    px = list(im.crop(box).convert('L').tobytes())
    return sum(1 for v in px if v > 225) / max(len(px), 1)

def paint_band(im, strict=False):
    """La franja blanca pasa por detrás de la cabeza: se pinta con el azul que hay justo debajo, columna por columna."""
    from tercer_semestre import band_profile, smooth_curve
    w, h = im.size
    px = im.load()
    curve = smooth_curve(band_profile(px, w, h), w)
    samples = [px[x, min(h - 1, curve[x] + 6)] for x in range(w)]
    # color de relleno: mediana de lo que hay debajo de la franja en las columnas vecinas
    # (así, si debajo está la figura, manda el fondo de alrededor)
    is_bg = lambda c: c[2] > c[0] + 10 and c[2] >= c[1] and sum(c) < 330
    ok = [c for c in samples if is_bg(c)] or [(10, 20, 60)]
    glob_med = tuple(sorted(c[i] for c in ok)[len(ok) // 2] for i in range(3))
    fills = []
    for x in range(w):
        win = [c for c in samples[max(0, x - 120): x + 121] if is_bg(c)]
        loc = tuple(sorted(c[i] for c in win)[len(win) // 2] for i in range(3)) if len(win) > 10 else glob_med
        # mitad local, mitad general (estricto: solo el general, la figura deja columnas claras debajo)
        fills.append(glob_med if strict else tuple((a + b) // 2 for a, b in zip(loc, glob_med)))
    for x in range(w):
        # bordes de la franja medidos antes de pintar (blanco puro de la franja)
        white = [y for y in range(min(h, curve[x] + 10)) if min(px[x, y]) > 190 and max(px[x, y]) - min(px[x, y]) < 12]
        for y in range(min(h, curve[x] + 2)):
            c = px[x, y]
            spread = max(c) - min(c)
            # estricto: solo el blanco de la franja y el negro de arriba (la figura gris claro se respeta)
            band = (min(c) > 190 and spread < 12) or max(c) < 22 if strict else spread < 28
            if band: px[x, y] = fills[x]
        if strict and white:  # líneas grises finitas de los bordes de la franja
            for y0, y1 in ((white[0] - 5, white[0] + 3), (white[-1] - 3, white[-1] + 7)):
                for y in range(max(0, y0), min(h, y1)):
                    c = px[x, y]
                    if max(c) - min(c) < 35 and c != fills[x]: px[x, y] = fills[x]
            for y in range(white[-1] + 1):  # negro/gris oscuro de arriba que quedó
                c = px[x, y]
                if max(c) - min(c) < 35 and sum(c) < 130: px[x, y] = fills[x]
    return im

def add_headroom(im, extra):
    """
    Agrega fondo arriba: color por columna (mediana de la fila de arriba en las columnas vecinas,
    así la figura no se estira) que se oscurece hacia arriba como la viñeta del compendio,
    y se funde suave con la foto para que no quede una franja marcada.
    """
    w, h = im.size
    is_bg = lambda c: c[2] > c[0] + 10 and c[2] >= c[1] and sum(c) < 330
    # muestras de fondo de las primeras filas (sin la figura)
    cols = [[im.getpixel((x, y)) for y in range(0, min(30, h), 3) if is_bg(im.getpixel((x, y)))] for x in range(w)]
    allbg = [c for col in cols for c in col] or [(10, 20, 60)]
    glob_med = tuple(sorted(c[i] for c in allbg)[len(allbg) // 2] for i in range(3))
    base = []
    for x in range(w):
        win = [c for col in cols[max(0, x - 150): x + 151] for c in col]
        base.append(tuple(sorted(c[i] for c in win)[len(win) // 2] for i in range(3)) if len(win) > 20 else glob_med)
    out = Image.new('RGB', (w, h + extra))
    out.paste(im, (0, extra))
    px = out.load()
    for y in range(extra):
        t = y / extra  # 0 arriba, 1 donde empieza la foto
        k = 0.55 + 0.45 * t
        for x in range(w):
            r, g, b = base[x]
            px[x, y] = (int(r * k), int(g * k), int(b * k))
    # fundido: las primeras filas de la foto se mezclan con el relleno (solo donde es fondo)
    blend = min(24, h)
    for y in range(blend):
        a = (y + 1) / (blend + 1)
        for x in range(w):
            c = px[x, extra + y]
            r, g, b = c
            if is_bg(c):  # fondo azul: se funde; la figura queda igual
                br, bg_, bb = base[x]
                px[x, extra + y] = (int(br * (1 - a) + r * a), int(bg_ * (1 - a) + g * a), int(bb * (1 - a) + b * a))
    return out

def trim(im, keep_top=False):
    w, h = im.size
    top = 0
    for y in range(0, min(220, h)):              # franja blanca del menú
        if bright_ratio(im, (0, y, w, y + 1)) > 0.15: top = y + 1
    top = 0 if keep_top else min(top + 6, h // 4)
    bottom = h
    for y in range(h - 1, h - 140, -1):           # barra de botones y restos del menú abajo
        if bright_ratio(im, (0, y, w, y + 1)) > 0.03: bottom = y
    bottom = max(bottom - 6, h * 3 // 4)
    left = 0
    for x in range(0, min(90, w)):                # letras y restos del menú a la izquierda
        if bright_ratio(im, (x, top, x + 1, bottom)) > 0.004: left = x + 1
    right = w
    for x in range(w - 1, max(w - 60, 0), -1):     # borde derecho
        if bright_ratio(im, (x, top, x + 1, bottom)) > 0.02: right = x
    return im.crop((min(left + 4, w // 5), top, max(right - 2, w * 4 // 5), bottom))

def main(src, game_text, personas_json, party_json, out):
    gt = json.load(open(game_text))['personas']
    ps = json.load(open(personas_json)); ps = ps if isinstance(ps, list) else list(ps.values())
    pt = json.load(open(party_json)); pt = pt if isinstance(pt, list) else list(pt.values())
    by_es = {}
    for p in ps + pt:
        es = gt.get(p['name'], {}).get('es', p['name'])
        by_es[norm(es)] = p['id']
    here = os.path.dirname(os.path.abspath(__file__))
    manual = json.load(open(os.path.join(here, 'recortes.json')))
    # fotos donde la franja del menú tapa la cabeza: se pinta en vez de recortarla
    paint = set(manual.get('_pintar_franja', []))
    paint_strict = set(manual.get('_pintar_franja_estricta', []))  # figura gris clara delante de la franja
    sys.path.insert(0, here)
    # las que se procesan con tercer_semestre.py (otro fondo) no se tocan acá
    other = {l.split('|')[1].strip() for l in open(os.path.join(here, 'tercer_semestre.txt')) if '|' in l and not l.startswith('#')}
    os.makedirs(out, exist_ok=True)
    missing, done = [], 0
    for folder in sorted(os.listdir(src)):
        pid = by_es.get(norm(folder))
        files = [f for f in os.listdir(os.path.join(src, folder)) if f.lower().endswith('.png')]
        if not files: continue
        if not pid: missing.append(folder); continue
        for f in files:
            side = 'de' if f.lower().endswith('-de.png') else 'iz' if f.lower().endswith('-iz.png') else None
            if not side: missing.append(f'{folder}/{f}'); continue
            if f'{pid}-{side}' in other: continue
            raw = Image.open(os.path.join(src, folder, f)).convert('RGB')
            box = manual.get(f'{pid}-{side}')
            strict = f'{pid}-{side}' in paint_strict
            painted = f'{pid}-{side}' in paint or strict
            if painted: raw = paint_band(raw, strict)
            im = raw.crop(tuple(box)) if box else trim(raw, keep_top=painted)
            extra = manual.get('_aire_arriba', {}).get(f'{pid}-{side}')
            if extra:  # la figura toca el borde de arriba: se agrega fondo para que respire
                im = add_headroom(im, extra)
            im.thumbnail((900, 900), Image.LANCZOS)
            im.save(os.path.join(out, f'{pid}-{side}.webp'), 'WEBP', quality=80, method=6)
            done += 1
    print(f'{done} fotos')
    for m in missing: print('  sin Persona:', m)

if __name__ == '__main__':
    main(*sys.argv[1:6])
