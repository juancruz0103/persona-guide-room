"""
Convierte forecast-guide.txt en src/games/p4g/data/generated/forecast.json con condiciones y efectos estructurados,
para mostrarlos traducidos en la web (nombres oficiales de Personas, skills y Arcanas).
Uso: python3 build_forecast.py <repo>
"""
import json
import os
import re
import sys

repo = sys.argv[1]
gen = f'{repo}/src/games/p4g/data/generated'
personas = json.load(open(f'{gen}/personas.json'))
skills = json.load(open(f'{gen}/skills.json'))
arcana = json.load(open(f'{gen}/fusion.json'))['arcanaNames']
norm = lambda s: re.sub(r'[^a-z0-9]', '', s.lower())
PBY = {norm(p['nameEn']): p['id'] for p in personas}
PBY.update({norm(p['name']): p['id'] for p in personas})
PBY.update({'cusith': PBY.get('cusith') or PBY.get('cusidhe'), 'yomotsuikusa': PBY.get('ikusa') or PBY.get('yomotsuikusa'),
            'hitokotonusi': PBY.get('hitokotonushi') or PBY.get('hitokotonusi')})
SBY = {norm(k): k for k in skills}
ABY = {norm(v['en']): k for k, v in arcana.items()}
missing = []


def persona(n):
    pid = PBY.get(norm(n))
    if not pid:
        missing.append(('persona', n))
    return pid or n


def arc(n):
    a = ABY.get(norm(n)) or ABY.get(norm(n).replace('man', ''))
    if not a:
        missing.append(('arcana', n))
    return a or n


def condition(c):
    if c == 'None':
        return None
    m = re.match(r'Fuse an? (.+) Persona$', c)
    if m:
        return {'type': 'resultArcana', 'arcana': arc(m[1])}
    m = re.match(r'Fuse (.+)$', c)
    if m:
        return {'type': 'result', 'persona': persona(m[1])}
    m = re.match(r'Use (.+) as (?:a )?fusion materials?$', c)
    if m:
        parts = re.split(r' and ', m[1])
        if all(re.search(r'Persona$', p) for p in parts):
            return {'type': 'materialArcana', 'arcanas': [arc(re.sub(r'^an? | Persona$', '', p).strip()) for p in parts]}
        return {'type': 'material', 'personas': [persona(p) for p in parts]}
    missing.append(('cond', c))
    return {'type': 'raw', 'text': c}


KINDS = {'recovery': 'recovery', 'wind': 'wind', 'ice': 'ice', 'fire': 'fire', 'elec': 'elec', 'support': 'support'}


def effects(e):
    out = []
    for part in [x.strip() for x in e.split(';')]:
        if part == 'Stats increase':
            out.append({'type': 'stats'})
        elif part == 'Skill change':
            out.append({'type': 'skillChange'})
        elif part == 'Social Link EXP':
            out.append({'type': 'linkExp'})
        else:
            m = re.match(r'Learn an? (\w+) skill$', part)
            if m:
                out.append({'type': 'skillKind', 'kind': KINDS[m[1].lower()]})
                continue
            m = re.match(r'Learn (.+)$', part)
            if m:
                k = SBY.get(norm(m[1]))
                if not k:
                    missing.append(('skill', m[1]))
                out.append({'type': 'skill', 'skill': k or m[1]})
                continue
            missing.append(('effect', part))
    return out


days = []
for line in open(os.path.join(os.path.dirname(__file__), 'forecast-guide.txt')):
    if not line[0].isdigit():
        continue
    d, c, e = line.rstrip('\n').split('|')
    m, dd = map(int, d.split('/'))
    days.append({'month': m, 'day': dd, 'condition': condition(c), 'effects': effects(e)})
json.dump({'source': 'Megami Tensei Wiki (Calendar in Persona 4 Golden)', 'days': days}, open(f'{gen}/forecast.json', 'w'),
          ensure_ascii=False, indent=1)
print(len(days), 'días', missing)
