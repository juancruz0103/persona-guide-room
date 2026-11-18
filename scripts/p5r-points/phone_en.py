"""
Completa las llamadas de teléfono de Royal (E700_300.BMD) que la guía cargó incompletas: busca la elección por el
texto en inglés, pone todas las opciones con el texto oficial (ES y EN), los puntos del juego y la frase oficial
que dice el confidente justo antes de la elección.
Uso: python3 phone_en.py <E700_300.BMD en español> <E700_300.BMD en inglés> <carpeta data/confidants>
"""
import difflib
import glob
import json
import os
import struct
import sys

sys.path.insert(0, os.path.dirname(__file__))
from verify import items, norm, page_text  # noqa: E402
from apply import TIER, shown  # noqa: E402


def pages(path):
    """Texto de cada página de los mensajes, en orden, con None en el lugar de cada elección."""
    d = open(path, 'rb').read()
    n = struct.unpack('>I', d[0x18:0x1c])[0]
    out = []
    for k in range(n):
        typ, off = struct.unpack('>II', d[0x20 + k * 8:0x28 + k * 8]); p = off + 0x20
        if typ == 0:
            cnt = struct.unpack('>H', d[p + 24:p + 26])[0]
            offs = struct.unpack('>' + 'I' * cnt, d[p + 28:p + 28 + 4 * cnt])
            out.append([page_text(d[o + 0x20:]) for o in offs])
        else:
            out.append(None)
    return out


def calls(es, en):
    """Elecciones del archivo en orden, con las opciones en los dos idiomas, los códigos de puntos y las frases previas."""
    a, b = list(items(es)), list(items(en))
    pa, pb = pages(es), pages(en)
    out, cur = [], None
    for i, ((k, v), (_, w)) in enumerate(zip(a, b)):
        if k == 'sel':
            if cur and [norm(o) for o in cur['es']] == [norm(o) for o in v] and not cur['codes']:
                continue  # la misma elección repetida (otra condición) comparte las respuestas
            before = [j for j in range(max(0, i - 3), i) if pa[j]]
            cur = {'es': v, 'en': w, 'codes': [],
                   'lines': [(x, y) for j in before for x, y in zip(pa[j], pb[j])]}
            out.append(cur)
        elif cur is not None:
            cur['codes'] += v
    return out


def match(table, opts):
    ours = [norm(o.get('en', '')) for o in opts]
    best = None
    for c in table:
        key = [norm(o) for o in c['en']]
        used, score = set(), []
        for o in ours:
            r, j = max(((difflib.SequenceMatcher(None, o, k).ratio(), j) for j, k in enumerate(key) if j not in used),
                       default=(0, -1))
            if r < 0.85:
                break
            used.add(j); score.append(j)
        else:
            if not best or len(c['en']) < len(best[1]['en']):
                best = (score, c)
    return best


def main():
    table = calls(sys.argv[1], sys.argv[2])
    index = {tuple(norm(o) for o in c['es']) for c in table}
    done, skipped = 0, []
    for f in sorted(glob.glob(os.path.join(sys.argv[3], '*.json'))):
        d = json.load(open(f))
        if not isinstance(d, dict):
            continue
        dirty = False
        for r in d.get('ranks', []):
            for c in r.get('conversations', []):
                if c.get('kind') != 'phone' or 'options' not in c:
                    continue
                if tuple(norm(o['es']) for o in c['options']) in index:
                    continue
                m = match(table, c['options'])
                if not m:
                    skipped.append((d['id'], r['rank']))
                    continue
                cols, hit = m
                codes = [x for x in hit['codes'] if x in TIER]
                n = len(hit['en'])
                if len(codes) == n:
                    pts = [shown(x) for x in codes]
                elif len(codes) == len(cols):
                    pts = [0] * n
                    for j, x in zip(sorted(cols), codes):
                        pts[j] = shown(x)
                elif not codes:
                    pts = [0] * n
                else:
                    skipped.append((d['id'], r['rank'], 'códigos'))
                    continue
                c['options'] = [{'en': e, 'es': s, 'points': p} for e, s, p in zip(hit['en'], hit['es'], pts)]
                # La frase del confidente: la línea del juego más parecida a la que tenía la guía.
                if c.get('prompt') and hit['lines']:
                    best = max(hit['lines'], key=lambda l: difflib.SequenceMatcher(None, norm(c['prompt']['en']), norm(l[1])).ratio())
                    if difflib.SequenceMatcher(None, norm(c['prompt']['en']), norm(best[1])).ratio() >= 0.6:
                        c['prompt'] = {'es': best[0], 'en': best[1]}
                        c.pop('provisional', None)
                print(d['id'], r['rank'], [(o['es'], o['points']) for o in c['options']], c['prompt']['es'], c.get('provisional', ''))
                done += 1
                dirty = True
        if dirty:
            with open(f, 'w') as fh:
                json.dump(d, fh, ensure_ascii=False, indent=1)
                fh.write('\n')
    print('completadas:', done, 'sin cruzar:', skipped)


if __name__ == '__main__':
    main()
