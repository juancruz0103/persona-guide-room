#!/usr/bin/env python3
"""
Convierte las ilustraciones de Persona 4 Golden (camp/persona/pst_XXX.tmx,
XXX = id del juego en hexadecimal) a WebP con fondo transparente.

Uso: python3 -I persona_images.py <carpeta camp/persona> <personas.json> <salida>
Se guarda una sola imagen por Persona; la vista del perfil se espeja con CSS.
"""
import json
import os
import struct
import sys

import numpy as np
from PIL import Image

MAX = 720


def tmx(path):
    b = open(path, 'rb').read()
    if b[8:12] != b'TMX0':
        raise ValueError('no es TMX')
    w, h = struct.unpack_from('<HH', b, 0x12)
    if b[0x16] != 0:
        raise ValueError(f'formato de píxel {b[0x16]} no soportado')
    a = np.frombuffer(b[0x40:0x40 + w * h * 4], np.uint8).reshape(h, w, 4).copy()
    a[..., 3] = np.minimum(255, a[..., 3].astype(np.uint16) * 2).astype(np.uint8)  # alfa PS2: 0..128
    return Image.fromarray(a, 'RGBA')


def main():
    src, personas_json, out = sys.argv[1:4]
    os.makedirs(out, exist_ok=True)
    personas = json.load(open(personas_json, encoding='utf-8'))
    done = 0
    for p in personas:
        if p.get('gameId') is None:
            print('sin id del juego:', p['id'])
            continue
        path = os.path.join(src, f"pst_{p['gameId']:03x}.tmx")
        if not os.path.exists(path):
            print('falta', path, p['id'])
            continue
        im = tmx(path)
        box = im.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()
        if box:
            pad = 12
            im = im.crop((max(0, box[0] - pad), max(0, box[1] - pad), min(im.width, box[2] + pad), min(im.height, box[3] + pad)))
        im.thumbnail((MAX, MAX), Image.LANCZOS)
        im.save(os.path.join(out, f"{p['id']}.webp"), 'WEBP', quality=84, method=6)
        done += 1
    print('imágenes:', done)


if __name__ == '__main__':
    main()
