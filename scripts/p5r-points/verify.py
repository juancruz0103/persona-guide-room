"""
Compara los puntos de las respuestas de confidentes (datos de guías) con los del juego.
En los mensajes de los eventos (EVENT_DATA/MESSAGE/E700/*.BMD) la respuesta que suma puntos lleva la función
F4 AD: [arcana+1, 01, puntos (código), 01, ...]. Para cada elección (SEL) se toman los códigos en el orden en que
aparecen en las respuestas hasta la siguiente elección.
Uso: python3 verify.py <carpeta E700 con los .BMD> <carpeta data/confidants>
"""
import glob
import json
import os
import re
import struct
import sys
from collections import Counter

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'import-confidants'))
from extract import page_text  # noqa: E402

norm = lambda s: re.sub(r'[^a-z0-9ñáéíóúü]', '', s.lower())


def items(path):
    d = open(path, 'rb').read()
    n = struct.unpack('>I', d[0x18:0x1c])[0]
    for k in range(n):
        typ, off = struct.unpack('>II', d[0x20 + k * 8:0x28 + k * 8]); p = off + 0x20
        if typ == 0:
            pages = struct.unpack('>H', d[p + 24:p + 26])[0]
            offs = struct.unpack('>' + 'I' * pages, d[p + 28:p + 28 + 4 * pages])
            size = struct.unpack('>I', d[p + 28 + 4 * pages:p + 32 + 4 * pages])[0]
            raw = d[offs[0] + 0x20:p + 32 + 4 * pages + size] if pages else b''
            codes = [m.group(1)[0] for m in re.finditer(rb'\xf4\xad.\x01(.)\x01', raw, re.S)]
            yield ('msg', codes)
        else:
            cnt = struct.unpack('>H', d[p + 26:p + 28])[0]
            offs = struct.unpack('>' + 'I' * cnt, d[p + 32:p + 32 + 4 * cnt])
            yield ('sel', [page_text(d[o + 0x20:]) for o in offs])


def sels(folder):
    out = {}
    for f in sorted(glob.glob(os.path.join(folder, '*.BMD'))):
        cur = None
        for kind, v in items(f):
            if kind == 'sel':
                key = tuple(norm(o) for o in v)
                # Una elección repetida seguida (la misma con otra condición de atributo) comparte las respuestas.
                if cur is not None and cur.get('key') == key and not cur['codes']:
                    continue
                cur = {'file': os.path.basename(f), 'codes': [], 'key': key}
                out.setdefault(key, []).append(cur)
            elif cur is not None:
                cur['codes'] += v
    return out


def main():
    index = sels(sys.argv[1])
    pairs, stats, bad = Counter(), Counter(), []
    for f in sorted(glob.glob(os.path.join(sys.argv[2], '*.json'))):
        d = json.load(open(f))
        if not isinstance(d, dict):
            continue
        for r in d.get('ranks', []):
            for c in r.get('conversations', []):
                if c.get('kind') == 'phone' or 'options' not in c:
                    continue
                key = tuple(norm(o.get('es', '')) for o in c['options'])
                hits = index.get(key)
                if not hits:
                    stats['sin cruzar'] += 1
                    continue
                codes = hits[0]['codes']
                pts = [o['points'] for o in c['options'] if o['points']]
                if len(codes) == len(pts):
                    for a, b in zip(codes, pts):
                        pairs[(a, b)] += 1
                    stats['mismo largo'] += 1
                else:
                    stats['distinto largo'] += 1
                    bad.append((d['id'], r['rank'], [o['es'] for o in c['options']], [o['points'] for o in c['options']], codes, hits[0]['file']))
    print(stats)
    print(sorted(pairs.items()))
    for b in bad[:40]:
        print(b)


if __name__ == "__main__":
    main()
