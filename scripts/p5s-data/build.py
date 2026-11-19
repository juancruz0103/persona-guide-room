"""
Datos de Persona 5 Strikers para la calculadora.
Fuente: aqiu384/megaten-fusion-tool (dominio público), carpeta src/app/p5s/data.
Los nombres oficiales en español salen del texto de Royal (mismas Personas y habilidades);
si una no existe en Royal, queda el nombre en inglés.
Uso: python3 build.py <carpeta p5s/data de aqiu384> <carpeta raíz del repo>
"""
import json
import os
import re
import sys

SRC, REPO = sys.argv[1], sys.argv[2]
OUT = os.path.join(REPO, 'src/games/p5s/data/generated')
P5R = os.path.join(REPO, 'src/games/p5r/data/generated')

load = lambda f: json.load(open(os.path.join(SRC, f)))
demons, party, skills = load('demon-data.json'), load('party-data.json'), load('skill-data.json')
specials, pairs, downs, prereqs = load('special-recipes.json'), load('pair-recipes.json'), load('down-recipes.json'), load('fusion-prereqs.json')
cfg = load('comp-config.json')
royal_text = json.load(open(os.path.join(P5R, 'game-text.json')))
royal_personas = {p['name']: p for p in json.load(open(os.path.join(P5R, 'personas.json')))}
royal_party = {p['name']: p for p in json.load(open(os.path.join(P5R, 'party.json')))}

RES = dict(zip(cfg['resistElems'], ['phy', 'gun', 'fir', 'ice', 'ele', 'win', 'psy', 'nuk', 'ble', 'cur']))
AFF = {'w': 'weak', '-': 'neutral', 's': 'resist', 'n': 'null', 'r': 'repel', 'd': 'drain'}
ELEM = {'phy': 'phy', 'gun': 'gun', 'fir': 'fir', 'ice': 'ice', 'ele': 'ele', 'win': 'win', 'psy': 'psy', 'nuk': 'nuk',
        'lig': 'ble', 'dar': 'cur', 'alm': 'alm', 'ail': 'ail', 'rec': 'rec', 'sup': 'sup', 'pas': 'pas'}
OWNER = {'Pithos': 'sophia', 'Arsene': 'joker', 'Captain Kidd': 'skull', 'Zorro': 'mona', 'Carmen': 'panther', 'Goemon': 'fox',
         'Johanna': 'queen', 'Necronomicon': 'oracle', 'Milady': 'noir', 'Valjean': 'wolf'}
PLACE = {'Shibuya': ('Cárcel de Shibuya', 'Shibuya Jail'), 'Sendai': ('Cárcel de Sendai', 'Sendai Jail'),
         'Sapporo': ('Cárcel de Sapporo', 'Sapporo Jail'), 'Okinawa': ('Cárcel de Okinawa', 'Okinawa Jail'),
         'Kyoto': ('Cárcel de Kioto', 'Kyoto Jail'), 'Osaka': ('Cárcel de Osaka', 'Osaka Jail'),
         'Abyss': ('Abismo', 'Abyss'), 'Tree': ('Árbol de la Vida y la Sabiduría', 'Tree of Life and Wisdom')}


def slug(name):
    s = name.lower().replace("'", '').replace('ü', 'u').replace('é', 'e').replace('è', 'e')
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')


def royal_id(name):
    p = royal_personas.get(name) or royal_party.get(name)
    return p['id'] if p else slug(name)


# Textos de origen de las Personas nuevas de Strikers (capturas del juego en español).
NEW_TEXT = {
    'Pithos': {'es': 'Pithos', 'en': 'Pithos',
               'mythEs': 'Unos misteriosos objetos que Sophia usa en combate para imitar el poder de los usuarios de Personas. Son similares a las propias Personas, pero no se sabe cómo funcionan. Su nombre proviene de la palabra griega que significa «vasija».'},
    'Valjean': {'es': 'Valjean', 'en': 'Valjean',
                'mythEs': 'El protagonista de «Los miserables», de Victor Hugo. Lo encarcelaron por robar pan para sus sobrinos famélicos y acabó consumido por el rencor, pero despertó gracias a la piedad de un obispo. Luchó por defender a los pobres y oprimidos.'},
}


def persona(name, d, is_party):
    t = royal_text['personas'].get(name) or NEW_TEXT.get(name, {})
    loc = d.get('location')
    return {
        'id': royal_id(name),
        'name': name,
        'nameEn': t.get('en') or name,
        'nameEs': t.get('es') or None,
        'arcana': d['race'].lower().replace('judgement', 'judgement'),
        'level': d['lvl'],
        'treasure': d['race'] == 'Treasure',
        'party': OWNER.get(name) if is_party else None,
        'resistances': {RES[e]: AFF[c] for e, c in zip(cfg['resistElems'], d['resists'])},
        'stats': dict(zip(['st', 'ma', 'en', 'ag', 'lu'], d['stats'])),
        'skills': [{'skill': s, 'level': (lv or None)} for s, lv in sorted(d['skills'].items(), key=lambda x: x[1])],
        'inheritance': d.get('inherits'),
        'location': {'es': PLACE[loc][0], 'en': PLACE[loc][1]} if loc in PLACE else ({'es': loc, 'en': loc} if loc else None),
        'prereq': prereqs.get(name),
        'special': [{'name': r[:-3], 'level': int(r[-2:])} for r in specials.get(name, [])] or None,
        'recipes': [r.split(' x ') for r in pairs.get(name, [])],
        'down': downs.get(name, []),
        'mythEs': t.get('mythEs'),
        'mythEn': t.get('mythEn'),
    }


# Los «Treasure» de la fuente son enemigos que no se pueden conseguir como Persona (confirmado en el juego).
out = [persona(n, d, False) for n, d in demons.items() if d['race'] != 'Treasure'] + [persona(n, d, True) for n, d in party.items()]
# Royal usa "Johanna" con otro id; los compañeros sin imagen propia quedan con su slug
RT = royal_text['skills']


def derived(name):
    """Resist/Absorber/Anular + elemento que no están en Royal: se arman con el mismo patrón oficial de Royal."""
    m = re.match(r'(Resist|Drain|Null) (\w+)$', name)
    if not m:
        return None
    verb = {'Resist': 'Resistir', 'Drain': 'Absorber', 'Null': 'Anular'}[m.group(1)]
    for fam in ('Null', 'Drain', 'Resist'):
        es = RT.get(f'{fam} {m.group(2)}', {}).get('es')
        if es:
            return {'es': f"{verb} {es.split(' ', 1)[1]}", 'en': name, 'derived': True}
    return None


sk = {}
for name, s in skills.items():
    t = RT.get(name) or derived(name) or {}
    sk[name] = {
        'name': name, 'nameEn': t.get('en') or name, 'nameEs': t.get('es') or None,
        'element': ELEM.get(s['element'], s['element']), 'effect': s.get('effect'),
        'descEs': t.get('descEs'), 'descEn': t.get('descEn'), 'cost': s.get('cost'), 'rank': s.get('rank'),
        'derivedName': bool(t.get('derived')),
    }
missing_p = [p['name'] for p in out if not p['nameEs']]
missing_s = [n for n, s in sk.items() if not s['nameEs']]
os.makedirs(OUT, exist_ok=True)
json.dump(out, open(os.path.join(OUT, 'personas.json'), 'w'), ensure_ascii=False, indent=1)
json.dump(sk, open(os.path.join(OUT, 'skills.json'), 'w'), ensure_ascii=False, indent=1)
json.dump({'source': 'https://github.com/aqiu384/megaten-fusion-tool', 'personas': len(out), 'skills': len(sk)},
          open(os.path.join(OUT, 'meta.json'), 'w'), ensure_ascii=False, indent=1)
print(len(out), 'Personas,', len(sk), 'habilidades')
print('sin nombre ES:', missing_p)
print('habilidades sin texto ES:', len(missing_s), missing_s[:60])
