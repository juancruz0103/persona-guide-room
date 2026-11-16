"""Limpia capturas de Personas de Reload (pantalla del compendio).
- Tapa con blanco la «E» y la flecha roja que quedan dentro de la franja blanca.
- Recorta texto suelto del borde izquierdo (descripción del compendio).
- Guarda en WebP: <id>-de / <id>-iz (máx. 900 px de ancho).
Uso: python3 -I clean_persona_shot.py <carpeta_capturas> <carpeta_salida> <personas.json> [--debug carpeta]
Acepta archivos sueltos («Nombre-de.png») o una carpeta por Persona («Nombre/…-de.png»).
El nombre (de la carpeta o del archivo) se busca entre los nombres en español e inglés de personas.json.
"""
import json, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage

EXTRA: dict = {}

def clean(path):
    import cv2
    im = Image.open(path).convert('RGB')
    a = np.asarray(im).astype(np.int16)
    h, w, _ = a.shape
    R, G, B = a[..., 0], a[..., 1], a[..., 2]
    mx, mn = a.max(axis=2), a.min(axis=2)
    white = mn > 232
    zone = np.zeros((h, w), bool)
    zone[: int(0.32 * h), : int(0.55 * w)] = True
    mask = np.zeros((h, w), bool)
    manual = np.zeros((h, w), bool)
    for (x0, y0, x1, y1) in EXTRA.get(os.path.basename(path), []):
        manual[y0:y1, x0:x1] = True
    # 1) «E»: recuadro gris oscuro sin color (con letra blanca y contorno negro).
    gray = zone & (mx - mn < 22) & (mx > 40) & (mx < 115)
    lab, _ = ndimage.label(ndimage.binary_closing(gray, iterations=2))
    e_box = None
    for i, sl in enumerate(ndimage.find_objects(lab), start=1):
        ys, xs = sl
        bh, bw = ys.stop - ys.start, xs.stop - xs.start
        area = (lab[sl] == i).sum()
        if bh < 0.025 * h or bh > 0.2 * h or not (0.6 < bh / max(bw, 1) < 1.7) or area < 0.3 * bh * bw: continue
        # tiene que tener la letra blanca adentro y estar sobre la franja blanca
        inside_white = white[sl].mean()
        ry0, ry1 = max(0, ys.start - bh // 2), min(h, ys.stop + bh // 2)
        rx0, rx1 = max(0, xs.start - bw // 2), min(w, xs.stop + bw // 2)
        ring = white[ry0:ry1, rx0:rx1].mean()
        if not (0.08 < inside_white < 0.6) or ring < 0.3: continue
        if e_box is None or bh * bw > (e_box[1] - e_box[0]) * (e_box[3] - e_box[2]):
            e_box = (ys.start, ys.stop, xs.start, xs.stop)
    if e_box:
        y0, y1, x0, x1 = e_box
        eh, ew = y1 - y0, x1 - x0
        py, px = int(0.28 * eh), int(0.28 * ew)
        Y0, Y1, X0, X1 = max(0, y0 - py), min(h, y1 + py), max(0, x0 - px), min(w, x1 + px)
        sub = np.zeros((h, w), bool)
        sub[Y0:Y1, X0:X1] = True
        mask |= sub & ((mx - mn < 40) | (mx < 90))  # gris, negro y blanco del ícono
        # la flecha va a la derecha de la «E», a la misma altura
        arrow_zone = np.zeros((h, w), bool)
        arrow_zone[max(0, y0 - int(0.35 * eh)): min(h, y1 + int(0.2 * eh)), x1: min(w, x1 + int(1.7 * ew))] = True
    else:
        arrow_zone = zone
    # 2) Flecha roja con contorno negro.
    redish = arrow_zone & (R > 150) & (R - G > 45) & (R - B > 30)
    near_white = ndimage.uniform_filter(white.astype(float), size=31) > 0.35
    rl, _ = ndimage.label(redish & near_white)
    for i, sl in enumerate(ndimage.find_objects(rl), start=1):
        ys, xs = sl
        if (rl[sl] == i).sum() > 0.01 * h * w: continue
        bh, bw = ys.stop - ys.start, xs.stop - xs.start
        Y0, Y1 = max(0, ys.start - int(0.3 * bh)), min(h, ys.stop + int(0.3 * bh))
        X0, X1 = max(0, xs.start - int(0.4 * bw)), min(w, xs.stop + int(0.3 * bw))
        sub = np.zeros((h, w), bool)
        sub[Y0:Y1, X0:X1] = True
        mask |= sub & ((R - G > 25) | (mx < 90) | white)
    # 3) Manchas sueltas no blancas rodeadas de blanco (restos chicos del ícono).
    lab2, _ = ndimage.label(~white)
    for i, sl in enumerate(ndimage.find_objects(lab2), start=1):
        ys, xs = sl
        if (lab2[sl] == i).sum() > 0.004 * h * w: continue
        if ys.stop > 0.32 * h or xs.start > 0.55 * w: continue
        mask |= lab2 == i
    # 4) Texto de la descripción del compendio pegado al borde izquierdo: se borra (sin recortar).
    strip = int(0.13 * w)
    txt = np.zeros((h, w), bool)
    txt[int(0.30 * h):, :strip] = mn[int(0.30 * h):, :strip] > 195
    tl, _ = ndimage.label(ndimage.binary_dilation(txt, iterations=3))
    lines = []
    for j, sl in enumerate(ndimage.find_objects(tl), start=1):
        ys, xs = sl
        if 8 <= ys.stop - ys.start <= 60 and xs.stop - xs.start < 0.13 * w:
            lines.append((j, xs.start))
    if any(x0 <= 3 for _, x0 in lines):
        for j, _ in lines:
            mask |= tl == j
    # 5) Puntitos sueltos de la interfaz abajo de todo.
    low = np.zeros((h, w), bool)
    low[int(0.8 * h):] = mn[int(0.8 * h):] > 170
    ll, _ = ndimage.label(low)
    for j, sl in enumerate(ndimage.find_objects(ll), start=1):
        ys, xs = sl
        ar = (ll[sl] == j).sum()
        if ar < 0.0004 * h * w and ys.stop - ys.start < 0.03 * h and xs.stop - xs.start < 0.03 * h:
            Y0, Y1, X0, X1 = max(0, ys.start - 6), min(h, ys.stop + 6), max(0, xs.start - 6), min(w, xs.stop + 6)
            if mx[Y0:Y1, X0:X1].min() < 80 and (mn[Y0:Y1, X0:X1] > 170).mean() < 0.5:
                mask |= ll == j
    mask = ndimage.binary_dilation(mask, iterations=3) | manual
    rgb = np.ascontiguousarray(a.astype(np.uint8))
    out = cv2.inpaint(rgb, mask.astype(np.uint8) * 255, 7, cv2.INPAINT_TELEA).astype(np.int16)
    # Donde la franja es blanca pura, queda blanco parejo.
    out[mask & ~manual & near_white & (ndimage.uniform_filter(white.astype(float), size=15) > 0.5)] = 255
    crop_left = 0
    img = Image.fromarray(out.astype(np.uint8)).crop((crop_left, 0, w, h))
    if img.width > 900:
        img = img.resize((900, round(img.height * 900 / img.width)), Image.LANCZOS)
    return img, crop_left

if __name__ == '__main__':
    src, dst, mapping = sys.argv[1:4]
    debug = sys.argv[sys.argv.index('--debug') + 1] if '--debug' in sys.argv else None
    # Retoques a mano: rectángulos (x0, y0, x1, y1) a borrar en archivos donde el ícono queda sobre la Persona.
    extra = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'persona-shot-fixes.json')
    if os.path.exists(extra): EXTRA.update(json.load(open(extra)))
    import unicodedata
    fold = lambda t: unicodedata.normalize('NFD', t).encode('ascii', 'ignore').decode().lower().strip()
    data = json.load(open(mapping))
    names = {}
    for p in (data if isinstance(data, list) else []):
        for n in (p.get('nameEs'), p.get('name')):
            if n: names[fold(n)] = p['id']
    if isinstance(data, dict): names = {fold(k): v for k, v in data.items()}
    names.setdefault('lo', 'io')
    # Loki base y Loki DLC comparten nombre en español.
    names['loki'] = 'loki'; names['loki dlc'] = 'loki-a'
    os.makedirs(dst, exist_ok=True)
    files = []
    for root, _, fs in os.walk(src):
        files += [os.path.join(root, f) for f in fs if f.lower().endswith('.png')]
    for full in sorted(files):
        f = os.path.basename(full)
        stem, side = f[:-4].rsplit('-', 1)
        folder = os.path.basename(os.path.dirname(full))
        pid = names.get(fold(folder)) if os.path.dirname(full) != src.rstrip('/') else None
        pid = pid or names.get(fold(stem))
        if not pid or side.lower() not in ('de', 'iz'):
            print('salteo', full); continue
        side = side.lower()
        img, cl = clean(full)
        img.save(os.path.join(dst, f'{pid}-{side}.webp'), 'WEBP', quality=86, method=6)
        if debug:
            os.makedirs(debug, exist_ok=True); img.save(os.path.join(debug, f'{pid}-{side}.png'))
        print(f, '->', f'{pid}-{side}.webp', 'recorte izq', cl)
