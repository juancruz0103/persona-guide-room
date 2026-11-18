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


# Elecciones donde cada opción tiene varias respuestas: revisadas a mano mirando los mensajes (opciones en orden).
MANUAL = {
    ('¡¿Quieres decir... caca?!', 'Sabe a elefante.', 'Perdona, tengo que vomitar.'): [3, 3, 3],
    ('¿Qué piensa Takakura?', 'Tiene que haber una forma.', 'Deberías decirle eso.'): [3, 3, 3],
    ('¡Apártate de ella!', 'Estás peleando conmigo.', 'Voy a llamar a la policía.'): [3, 3, 0],
    ('Soy alumno.', 'Es complicado...', 'Tenemos un trato.'): [2, 0, 3],
    ('Seguro que no perdería.', 'No lo sé.', 'Probablemente.'): [3, 2, 0],
    ('Me gustas.', 'Te amo con locura.', '¿Podemos parar?'): [2, 0, 3],
    ('Qué modernas.', 'No son mi estilo.', 'Qué mal me quedan.'): [3, 0, 2],
    ('Claro.', 'Sigamos.', 'Como quieras.'): [2, 2, 0],
    ('Sin problema.', 'Digamos que es horario de vacaciones.'): [2, 2],
    ('Claro que sí.', 'Vamos a celebrarlo.', 'No me importa quién pague.'): [3, 3, 0],
    ('Ese parece necesario.', 'Sería mejor no sentirlo.', 'Es la semilla de un nuevo amor.'): [2, 0, 2],
    ('Me pareció un poco raro.', 'Cosas que pasan.', 'Seguro que hizo trampas.'): [3, 0, 3],
    ('Claro.', 'Soy tuyo para siempre.', 'Eso depende de ti.'): [2, 3, 0],
    ('Te estaré animando.', 'Eres un chico listo.', '¿Podrás contra él?'): [2, 0, 2],
}


def fuzzy(index, opts):
    """Busca la elección del juego que contiene todas estas opciones aunque el texto no sea idéntico
    (las llamadas se cargaron de la guía, a veces con otra traducción y sin todas las opciones)."""
    import difflib
    ours = [norm(o['es']) for o in opts]
    if len(ours) < 2 and len(ours[0]) < 12:
        return None  # una sola respuesta corta («Vale.») podría ser cualquier llamada
    best = None
    for key, hits in index.items():
        if len(key) < len(ours):
            continue
        used, score = set(), []
        for o in ours:
            r, j = max((difflib.SequenceMatcher(None, o, k).ratio(), j) for j, k in enumerate(key) if j not in used) if len(used) < len(key) else (0, -1)
            if r < 0.6:
                break
            used.add(j); score.append((r, j))
        else:
            avg = sum(r for r, _ in score) / len(score)
            if avg >= 0.7 and (not best or avg > best[0]):
                best = (avg, [j for _, j in score], hits[0], key)
    return best


def game_points(hit, n):
    """Puntos por opción de una elección del juego, cuando se pueden saber sin la guía."""
    codes = [x for x in hit['codes'] if x in TIER]
    if len(codes) == n:
        return [shown(x) for x in codes]
    if not codes:
        return [0] * n
    return None


def main():
    index = sels(sys.argv[1])
    raw = {}
    for f in sorted(glob.glob(os.path.join(sys.argv[1], '*.BMD'))):
        from verify import items
        cur = None
        for kind, v in items(f):
            if kind == 'sel':
                cur = tuple(norm(o) for o in v)
                raw.setdefault(cur, v)
    stats, changed = Counter(), []
    for f in sorted(glob.glob(os.path.join(sys.argv[2], '*.json'))):
        d = json.load(open(f))
        if not isinstance(d, dict):
            continue
        dirty = False
        for r in d.get('ranks', []):
            for c in r.get('conversations', []):
                if c.get('kind') not in ('conversation', 'phone') or 'options' not in c:
                    continue
                hits = index.get(tuple(norm(o.get('es', '')) for o in c['options']))
                if not hits and c.get('kind') == 'phone':
                    fz = fuzzy(index, c['options'])
                    gp = fz and game_points(fz[2], len(fz[3]))
                    if fz and gp is not None:
                        new = [gp[j] for j in fz[1]]
                        old = [(o['es'], o['points']) for o in c['options']]
                        for o, j, p in zip(c['options'], fz[1], new):
                            o['es'] = raw[fz[3]][j]
                            o['points'] = p
                            o.pop('recommended', None)
                        if [(o['es'], o['points']) for o in c['options']] != old:
                            changed.append((d['id'], r['rank'], old, [(o['es'], o['points']) for o in c['options']]))
                            dirty = True
                        stats['llamada (texto oficial)'] += 1
                        continue
                if not hits:
                    stats['sin cruzar'] += 1
                    continue
                codes = [x for x in hits[0]['codes'] if x in TIER]
                opts = c['options']
                nonzero = [i for i, o in enumerate(opts) if o['points']]
                manual = MANUAL.get(tuple(o['es'] for o in opts))
                if manual:
                    new = manual
                    stats['revisada a mano'] += 1
                elif len(codes) == len(opts):
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
                elif len(set(codes)) == 1 and nonzero:
                    # Varias opciones llevan a la misma respuesta (que da las notas): valen lo mismo.
                    new = [shown(codes[0]) if o['points'] else 0 for o in opts]
                    stats['respuesta compartida'] += 1
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
