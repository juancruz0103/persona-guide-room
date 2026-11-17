"""
Corrige los puntos de las respuestas de confidentes de Royal con los valores del juego.
El juego da 1, 2 o 3 notas (códigos 6, 11 y 16 en la función F4 AD de la respuesta). Llevar una Persona del
Arcana del confidente suma una nota más (máximo 3): la web muestra los puntos con esa nota extra, como las guías.
Uso: python3 apply.py <carpeta E700 con los .BMD> <carpeta data/confidants>
"""
import glob
import json
import os
import sys
from collections import Counter

sys.path.insert(0, os.path.dirname(__file__))
from verify import norm, sels  # noqa: E402

TIER = {6: 1, 11: 2, 16: 3}
shown = lambda code: min(TIER.get(code, 0) + 1, 3) if code in TIER else 0


def main():
    index = sels(sys.argv[1])
    stats, changed = Counter(), []
    for f in sorted(glob.glob(os.path.join(sys.argv[2], '*.json'))):
        d = json.load(open(f))
        if not isinstance(d, dict):
            continue
        dirty = False
        for r in d.get('ranks', []):
            for c in r.get('conversations', []):
                if c.get('kind') != 'conversation' or 'options' not in c:
                    continue
                hits = index.get(tuple(norm(o.get('es', '')) for o in c['options']))
                if not hits:
                    stats['sin cruzar'] += 1
                    continue
                codes = [x for x in hits[0]['codes'] if x in TIER]
                opts = c['options']
                nonzero = [i for i, o in enumerate(opts) if o['points']]
                if len(codes) == len(opts):
                    new = [shown(x) for x in codes]
                    stats['todas las opciones'] += 1
                elif not codes:
                    new = [0] * len(opts)
                    stats['ninguna da puntos'] += 1
                elif len(codes) == len(nonzero):
                    new = [0] * len(opts)
                    for i, x in zip(nonzero, codes):
                        new[i] = shown(x)
                    stats['mismas opciones'] += 1
                else:
                    stats['sin resolver'] += 1
                    print('sin resolver', d['id'], r['rank'], [o['es'] for o in opts], [o['points'] for o in opts], codes)
                    continue
                old = [o['points'] for o in opts]
                if new != old:
                    changed.append((d['id'], r['rank'], [o['es'] for o in opts], old, new))
                    for o, p in zip(opts, new):
                        o['points'] = p
                        o.pop('recommended', None)
                    dirty = True
        if dirty:
            with open(f, 'w') as fh:
                json.dump(d, fh, ensure_ascii=False, indent=1)
                fh.write('\n')
    print(stats, 'cambiadas:', len(changed))
    for x in changed:
        print(x)


if __name__ == "__main__":
    main()
