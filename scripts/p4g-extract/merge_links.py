"""
Cruza los diálogos oficiales (links-dialogs.json, de extract_links.py) con los puntos de la guía de RPG Site
(links-guide-points.txt) y genera src/games/p4g/data/generated/links.json.
Uso: python3 merge_links.py <links-dialogs.json> <repo>
"""
import difflib
import json
import re
import sys

dialogs, repo = sys.argv[1], sys.argv[2]
d = json.load(open(dialogs))
# carpeta de eventos → id del vínculo en la web
IDS = {'e620': 'strength-kou', 'e630': 'strength-daisuke', 'e700': 'sun-yumi', 'e710': 'sun-ayane'}
norm = lambda s: re.sub(r'[^a-z0-9]', '', s.lower().replace('’', "'").replace('…', '...'))

guide, cur, sec = {}, None, None
for line in open(f'{repo}/scripts/p4g-extract/links-guide-points.txt'):
    line = line.rstrip('\n')
    if not line:
        continue
    if line.startswith('@'):
        cur = line[1:]
        guide[cur] = {}
        continue
    m = re.match(r'RANK (\d+)->(\d+)\s*([FL])?$', line)
    if m:
        sec = (int(m[2]), m[3] or '')
        guide[cur].setdefault(sec, [])
        continue
    t, p = line.rsplit('|', 1)
    guide[cur][sec].append((norm(t), int(p), t))


def find(opts, n):
    best = None
    for o in opts:
        if o[0] == n:
            return o
        r = difflib.SequenceMatcher(None, o[0], n).ratio()
        if r > 0.82 and (not best or r > best[0]):
            best = (r, o)
    return best[1] if best else None


# Respuestas que eligen el romance (el resto de opciones de esa pregunta deja la relación como amistad).
ROMANCE = {
    ('priestess', '540_090'): ['"I really like you."'], ('lovers', '530_080'): ['Hold her'],
    ('chariot', '590_090'): ['"Will you be my girlfriend?"'], ('fortune', '610_081'): ['"Because I love you."'],
    ('moon', '670_062'): ['"I\'ll be your boyfriend."', '"Sounds good."'], ('sun-yumi', '700_100'): ['Hug her'],
    ('sun-ayane', '710_081'): ['Reveal your feelings for her'], ('aeon', '740_580'): ['"Because I love you."', 'Hug her'],
}


def rank_route(ev):
    """'610_020' → rango 2. Las carpetas que terminan en 5 (E595, E675…) son la ruta de amistad; la base, la
    romántica. Ayane es al revés (E715 es su romance).
    Adachi y Marie numeran desde 500 (500 = rango 1)."""
    pre, n = ev.split('_')
    n = int(n)
    rank = (n - 500) // 10 + 1 if n >= 500 else n // 10
    alt = pre.endswith('5')
    return max(1, min(10, rank)), ('L' if pre == '715' else 'F') if alt else ''


def points(g, rank, en):
    """Busca la respuesta en la guía, primero en el rango del evento y si no en los vecinos."""
    n = norm(en)
    for k in sorted(g, key=lambda k: (abs(k[0] - rank), k[0] < rank)):
        # lejos del rango solo se aceptan respuestas largas (las cortas, como "I don't know.", se repiten)
        if abs(k[0] - rank) > 1 and len(n) < 10:
            break
        hit = find(g[k], n)
        if hit:
            return hit, k
    return None, None


out, missing = {}, {}
for arc, folders in d.items():
    for folder, evs in folders.items():
        lid = IDS.get(folder, arc)
        g = guide.get(lid, {})
        used, res = set(), []
        alt_ranks = {rank_route(e['event'])[0]: rank_route(e['event'])[1] for e in evs if rank_route(e['event'])[1]}
        for e in evs:
            if not any(c['optsEn'] or c['opts'] for c in e['choices']):
                continue
            rank, route = rank_route(e['event'])
            choices = []
            for c in e['choices']:
                if all(o in ('NOT USED', '') for o in c['optsEn']) and all(o in ('NOT USED', '') for o in c['opts']):
                    continue  # preguntas sin usar que quedaron en el archivo
                opts = []
                for i in range(max(len(c['opts']), len(c['optsEn']))):
                    es = c['opts'][i] if i < len(c['opts']) else ''
                    en = c['optsEn'][i] if i < len(c['optsEn']) else ''
                    hit, k = points(g, rank, en)
                    if hit:
                        used.add(hit[2])
                    opt = {'es': es or en, 'en': en or es, 'pts': hit[1] if hit else 0}
                    if en in ROMANCE.get((lid, e['event']), []):
                        opt['route'] = 'L'
                    opts.append(opt)
                choices.append({'speaker': c['speaker'], 'speakerEn': c['speakerEn'], 'q': c['q'], 'qEn': c['qEn'], 'opts': opts})
            if not choices:
                continue
            if not route and rank in alt_ranks:
                route = 'F' if alt_ranks[rank] == 'L' else 'L'
            res.append({'event': e['event'], 'rank': rank, 'route': route, 'choices': choices})
        res.sort(key=lambda x: (x['rank'], x['route'], x['event']))
        out[lid] = res
        missing[lid] = sorted({o[2] for k in g for o in g[k]} - used)
json.dump(out, open(f'{repo}/src/games/p4g/data/generated/links.json', 'w'), ensure_ascii=False, indent=1)
for k, m in missing.items():
    if m:
        print('sin cruzar', k, m)
for k, v in out.items():
    print(k, [(e['event'][-3:], e['rank'], e['route']) for e in v])
