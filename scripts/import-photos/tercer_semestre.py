#!/usr/bin/env python3
"""
Fotos de las Personas del tercer semestre (capturas de la pantalla del equipo, fondo oscuro).

Uso: python3 -I tercer_semestre.py <entrada.png> <salida.webp> [recorte x0,y0,x1,y1|-] [zona a limpiar x0,y0,x1,y1 ...]

Arriba tienen una franja blanca curva del menú que a veces pasa por detrás de la figura,
así que en vez de recortarla se detecta la curva y se pinta con el color del fondo.
"""
import sys
from PIL import Image

def band_profile(px, w, h):
    """Para cada columna, dónde termina la franja clara que empieza arriba (o None)."""
    prof = []
    for x in range(w):
        seen, bot = False, None
        for y in range(0, min(220, h)):
            r, g, b = px[x, y]
            light = r > 170 and g > 170 and b > 170 and max(r, g, b) - min(r, g, b) < 30
            if light:
                seen, bot = True, y
            elif seen and y > bot + 3:
                break
        prof.append(bot)
    return prof

def smooth_curve(prof, w):
    """
    Límite de la franja por columna. Se usa lo medido en cada columna, pero si se aleja de la
    mediana de sus vecinas (porque ahí la figura tapa la franja) se toma la mediana.
    """
    import statistics
    vals = [y if (y is not None and y < 170) else None for y in prof]
    half = 90
    out = []
    for x in range(w):
        win = [v for v in vals[max(0, x - half): x + half + 1] if v is not None]
        med = statistics.median(win) if win else 0
        v = vals[x]
        lim = max(v, med) if (v is not None and abs(v - med) < 14) else med
        out.append(int(lim) + 6)
    return out

def grayish(r, g, b):
    # sin color: el blanco, el negro y los grises del borde de la franja (la figura suele tener color)
    return max(r, g, b) - min(r, g, b) < 28 and (r > 60 or r < 30)

def main(src, out, box=None, *zones):
    im = Image.open(src).convert('RGB')
    if box and box != '-':
        im = im.crop(tuple(int(v) for v in box.split(',')))
    w, h = im.size
    px = im.load()
    curve = smooth_curve(band_profile(px, w, h), w)
    bg = (17, 17, 19)
    for x in range(w):
        for y in range(curve[x]):
            r, g, b = px[x, y]
            # se pinta la franja (blanco, negro y grises del borde); lo que tiene color (la figura) queda
            if grayish(r, g, b):
                px[x, y] = bg
    for z in zones:  # restos del menú (íconos) en zonas marcadas a mano
        x0, y0, x1, y1 = (int(v) for v in z.split(','))
        for x in range(max(0, x0), min(w, x1)):
            for y in range(max(0, y0), min(h, y1)):
                r, g, b = px[x, y]
                if max(r, g, b) - min(r, g, b) < 40:
                    px[x, y] = bg
    im.thumbnail((900, 900), Image.LANCZOS)
    im.save(out, 'WEBP', quality=80, method=6)

if __name__ == '__main__':
    main(*sys.argv[1:])
