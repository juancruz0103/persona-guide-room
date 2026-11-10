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

def paint_band(im):
    """La franja blanca pasa por detrás de la cabeza: se pinta con el azul que hay justo debajo, columna por columna."""
    from tercer_semestre import band_profile, smooth_curve
    w, h = im.size
    px = im.load()
    curve = smooth_curve(band_profile(px, w, h), w)
    samples = [px[x, min(h - 1, curve[x] + 6)] for x in range(w)]
    # color de relleno: mediana de lo que hay debajo de la franja en las columnas vecinas
    # (así, si debajo está la figura, manda el fondo de alrededor)
    fills = []
    for x in range(w):
        win = samples[max(0, x - 120): x + 121]
        fills.append(tuple(sorted(c[i] for c in win)[len(win) // 2] for i in range(3)))
    for x in range(w):
        for y in range(min(h, curve[x] + 2)):
            c = px[x, y]
            if max(c) - min(c) < 28: px[x, y] = fills[x]
    return im

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
            painted = f'{pid}-{side}' in paint
            if painted: raw = paint_band(raw)
            im = raw.crop(tuple(box)) if box else trim(raw, keep_top=painted)
            extra = manual.get('_aire_arriba', {}).get(f'{pid}-{side}')
            if extra:  # la figura toca el borde de arriba: se agrega fondo (la primera fila estirada) para que respire
                strip = im.crop((0, 0, im.width, 1)).resize((im.width, extra))
                tall = Image.new('RGB', (im.width, im.height + extra)); tall.paste(strip, (0, 0)); tall.paste(im, (0, extra)); im = tall
            im.thumbnail((900, 900), Image.LANCZOS)
            im.save(os.path.join(out, f'{pid}-{side}.webp'), 'WEBP', quality=80, method=6)
            done += 1
    print(f'{done} fotos')
    for m in missing: print('  sin Persona:', m)

if __name__ == '__main__':
    main(*sys.argv[1:6])
