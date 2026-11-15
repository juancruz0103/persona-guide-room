"""Cruza los diálogos oficiales extraídos (links-dialogs.json) con los puntos de la guía
(links-guide-points.txt, transcripto de RPG Site) y genera links.json.
Uso: python3 -I merge_links.py <repo>"""
import json, re, sys, difflib
repo = sys.argv[1]
gen = f'{repo}/src/games/p3r/data/generated'
d = json.load(open(f'{gen}/links-dialogs.json'))
norm = lambda s: re.sub(r'[^a-z0-9]', '', s.lower().replace('’', "'").replace('…', '...'))
guide, cur, sec = {}, None, None
for line in open(f'{repo}/scripts/p3r-extract/links-guide-points.txt'):
    line = line.rstrip('\n')
    if not line: continue
    if line.startswith('@'): cur = line[1:]; guide[cur] = {}; continue
    m = re.match(r'RANK (\d+)->(\d+)\s*([RP])?', line)
    if m: sec = (int(m[2]), m[3] or ''); guide[cur].setdefault(sec, []); continue
    t, p = line.rsplit('|', 1)
    guide[cur][sec].append((norm(t), int(re.sub(r'\D', '', p) or 0), re.sub(r'\d', '', p), t))

def find(opts, n):
    best = None
    for o in opts:
        if o[0] == n: return o
        r = difflib.SequenceMatcher(None, o[0], n).ratio()
        if r > 0.85 and (not best or r > best[0]): best = (r, o)
    return best[1] if best else None

out, missing = {}, {}
for arc, v in d.items():
    g, used, evs = guide.get(arc, {}), set(), []
    for e in v['events']:
        ev = int(e['event'])
        # 0X0 = evento del rango X; los intermedios (0X5) pueden contar para X o X+1: se elige el que coincide con la guía
        base = min(ev // 10, 10) if ev <= 109 else ev // 10 - 10
        ranks = [base] if ev % 10 == 0 or ev > 100 else [base, min(base + 1, 10)]
        rank, bestsec, bestscore = base, None, 0
        for r in ranks:
            for k in [k for k in g if k[0] == r]:
                sc = sum(1 for c in e['choices'] for o in c['optsEn'] if find(g[k], norm(o)))
                if sc > bestscore: rank, bestsec, bestscore = r, k, sc
        if bestsec is None:
            ks = [k for k in g if k[0] == base]
            bestsec = ks[0] if ks else None
        route = bestsec[1] if bestsec and bestscore else ''
        if ev >= 180 and not route: route = 'P'
        choices = []
        for c in e['choices']:
            opts = []
            for es, en in zip(c['opts'], c['optsEn']):
                hit = find(g.get(bestsec, []), norm(en)) if bestsec else None
                if hit: used.add(hit[3])
                opts.append({'es': es, 'en': en, 'pts': hit[1] if hit else 0, 'route': hit[2] if hit else ''})
            choices.append({'speaker': c['speaker'], 'q': c['q'], 'qEn': c['qEn'], 'opts': opts})
        evs.append({'event': e['event'], 'rank': rank, 'route': route, 'choices': choices})
    missing[arc] = sorted({o[3] for k in g for o in g[k]} - used)
    out[arc] = {'npc': v['npc'], 'events': evs}
json.dump(out, open(f'{gen}/links.json', 'w'), ensure_ascii=False, indent=1)
for k, m in missing.items():
    if m: print('sin cruzar', k, m)
