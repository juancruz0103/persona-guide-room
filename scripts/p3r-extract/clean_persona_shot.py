"""Limpia capturas de Personas de Reload (pantalla del compendio).
- Tapa con blanco la «E» y la flecha roja que quedan dentro de la franja blanca.
- Recorta texto suelto del borde izquierdo (descripción del compendio).
- Guarda en WebP: <id>-de / <id>-iz (máx. 900 px de ancho).
Uso: python3 -I clean_persona_shot.py <carpeta_capturas> <carpeta_salida> <mapa.json> [--debug carpeta]
mapa.json: {"Hermes": "hermes", ...} (nombre del archivo sin -de/-iz → id).
"""
import json, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage

def clean(path):
    im = Image.open(path).convert('RGB')
    a = np.asarray(im).astype(np.int16)
    h, w, _ = a.shape
    white = a.min(axis=2) > 232
    # 1) Íconos dentro de la franja blanca: manchas no blancas rodeadas de blanco, arriba a la izquierda.
    lab, n = ndimage.label(~white)
    out = a.copy()
    e_box = None
    for i, sl in enumerate(ndimage.find_objects(lab), start=1):
        ys, xs = sl
        area = (lab[sl] == i).sum()
        if area > 0.03 * h * w: continue
        if ys.stop > 0.30 * h or xs.start > 0.55 * w: continue
        m = ndimage.binary_dilation(lab == i, iterations=3)
        out[m] = 255
        # la «E» es la mancha más grande y casi cuadrada
        bh, bw = ys.stop - ys.start, xs.stop - xs.start
        if 0.6 < bh / max(bw, 1) < 1.6 and (e_box is None or bh * bw > (e_box[1] - e_box[0]) * (e_box[3] - e_box[2])):
            e_box = (ys.start, ys.stop, xs.start, xs.stop)
    # 1a) Flecha pegada a la Persona: a la derecha de la «E», se borra solo lo rojo/rosado y el contorno negro.
    if e_box:
        y0, y1, x0, x1 = e_box
        eh, ew = y1 - y0, x1 - x0
        by0, by1 = max(0, y0 - int(0.25 * eh)), min(h, y1 + int(0.1 * eh))
        bx0, bx1 = x1, min(w, x1 + int(1.5 * ew))
        R, G, B = a[by0:by1, bx0:bx1, 0], a[by0:by1, bx0:bx1, 1], a[by0:by1, bx0:bx1, 2]
        arrow = ((R - G > 35) & (R > 150)) | (np.maximum(np.maximum(R, G), B) < 90)
        box = np.zeros((h, w), bool)
        box[by0:by1, bx0:bx1] = arrow
        out[ndimage.binary_dilation(box, iterations=2)] = 255
    # 1b) Restos de la flecha roja que tocan la Persona: rojo intenso en la franja blanca.
    near_white = ndimage.uniform_filter(white.astype(float), size=25) > 0.45
    red = (a[..., 0] > 170) & (a[..., 1] < 130) & (a[..., 2] < 150) & near_white
    red[int(0.22 * h):] = False
    red[:, int(0.40 * w):] = False
    out[ndimage.binary_dilation(red, iterations=4)] = 255
    # 2) Texto blanco de la descripción, en el borde izquierdo (abajo de la franja).
    crop_left = 0
    strip = int(0.14 * w)
    region = (a[:, :strip].min(axis=2) > 200)
    region[: int(0.35 * h)] = False
    tl, tn = ndimage.label(ndimage.binary_dilation(region, iterations=3))
    lines = []
    for j, sl in enumerate(ndimage.find_objects(tl), start=1):
        ys, xs = sl
        hgt = ys.stop - ys.start
        if 8 <= hgt <= 60 and xs.stop - xs.start < 0.13 * w:
            lines.append((xs.start, xs.stop))
    if lines and any(x0 <= 3 for x0, _ in lines):
        crop_left = max(x1 for _, x1 in lines) + 12
    img = Image.fromarray(out.astype(np.uint8)).crop((crop_left, 0, w, h))
    if img.width > 900:
        img = img.resize((900, round(img.height * 900 / img.width)), Image.LANCZOS)
    return img, crop_left

if __name__ == '__main__':
    src, dst, mapping = sys.argv[1:4]
    debug = sys.argv[sys.argv.index('--debug') + 1] if '--debug' in sys.argv else None
    names = json.load(open(mapping))
    os.makedirs(dst, exist_ok=True)
    for f in sorted(os.listdir(src)):
        if not f.lower().endswith('.png'): continue
        base, side = f[:-4].rsplit('-', 1)
        pid = names.get(base)
        if not pid or side not in ('de', 'iz'):
            print('salteo', f); continue
        img, cl = clean(os.path.join(src, f))
        img.save(os.path.join(dst, f'{pid}-{side}.webp'), 'WEBP', quality=86, method=6)
        if debug:
            os.makedirs(debug, exist_ok=True); img.save(os.path.join(debug, f'{pid}-{side}.png'))
        print(f, '->', f'{pid}-{side}.webp', 'recorte izq', cl)
