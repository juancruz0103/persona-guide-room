"""Ladrones Fantasma de Persona 5 Tactica: árbol de habilidades, habilidades de su Persona y armas.

Uso: python3 party.py <carpeta MonoBehaviour exportada> <raíz del repo>
"""
import json
import re
import sys
from pathlib import Path

RAW, ROOT = Path(sys.argv[1]), Path(sys.argv[2])
OUT = ROOT / 'src/games/p5t/data/generated'


def load(name):
    return json.load(open(RAW / name, encoding='utf-8-sig'))['param']


WORDS = {}
for f in RAW.glob('word_database*.json'):
    w = {x['Id']: x['Word'] for x in load(f.name)}
    t = w.get(14001, '')
    if t.startswith('A drunkard'):
        WORDS['en'] = w
    elif t.startswith('Un borracho'):
        WORDS['es'] = w
ES, EN = WORDS['es'], WORDS['en']

units = {u['ID']: u for u in load('unitdatabase.json')}
chars = {c['ID']: c for c in load('character_database.json')}
personas = {p['ID']: p for p in load('personadatabase.json')}
skills = {s['ID']: s for s in load('skilldatabase.json')}
passives = {p['ID']: p for p in load('passive_skill_database.json')}
tree_skills = {t['ID']: t for t in load('skilltree_treeskill_database.json')}
tree_names = {(n['CharaId'], n['TreeId']): n['NameWordKey'] for n in load('skilltree_name_database.json')}
weapons = load('weapondatabase.json')
recipes = {m['WeaponId']: m for m in load('weapon_make_database.json')}
TYPES = {10: 'burn', 20: 'freeze', 30: 'sweep', 40: 'despair', 50: 'shock',
         60: 'vortex', 70: 'brainwash', 80: 'dizzy', 90: 'forget', 100: 'sleep'}

# Unidad del jugador de cada Ladrón (la del árbol) y su prefijo de armas de fuego.
MEMBERS = [(1051, 1), (2051, 2), (3051, 3), (4051, 4), (5051, 5), (6051, 6), (7051, 7),
           (8051, 8), (9051, 9), (10051, 10), (11000, 11)]


def both(key):
    return {'es': ES.get(key), 'en': EN.get(key)}


def fill(text, value):
    """Los textos traen {0}: se completa con el valor de la pasiva/habilidad indicada."""
    if text is None:
        return None
    if value is None:  # sin dato: se saca la oración que lo usa
        return ' '.join(x for x in re.split(r'(?<=\.) ', text) if '{0}' not in x)
    return text.replace('{0}', str(value))


def param_value(ts):
    p = passives.get(ts['DescParamSkillId'])
    if p:
        return p['EffectValue']
    # Mejoras de habilidades: lo que crece el alcance respecto del nivel anterior.
    new, old = skills.get(ts['DescParamSkillId']), skills.get(ts['DescParamSkillId'] - 1)
    if new and old:
        for k in ('Range', 'HitParam'):
            if new[k] > old[k] > 0:
                return new[k] - old[k]
    return None


def skill_info(sid):
    s = skills.get(sid)
    if not s:
        return None
    return {
        'id': sid,
        'name': both(s['NameWordKey']),
        'desc': both(s['DescWordKey']),
        'cost': s['Cost'] or None,
        'costType': 'hp' if s['CostType'] == 1 else 'sp',
        'damage': [s['PersonaDamageMin'], s['PersonaDamageMax']] if s['PersonaDamageMax'] else None,
        'range': s['Range'] or None,
        'ailment': TYPES.get(s['AddEffectTypeParam1']) if s['AddEffectType1'] == 1 else None,
    }


rows_by_char = {}
for r in load('skilltree_database.json'):
    rows_by_char.setdefault(r['CharaId'], []).append(r)

out = []
for unit_id, prefix in MEMBERS:
    u = units[unit_id]
    c = chars[u['CharacterId']]
    rows = rows_by_char[unit_id]
    by_id = {r['ID']: r for r in rows}
    nodes, persona_skills = [], []
    for r in rows:
        ts = tree_skills[r['TreeSkillId']]
        kind = {8: 'learn', 9: 'upgrade'}.get(ts['TypeID'], 'passive')
        # Las mejoras (TypeID 9) apuntan a la habilidad base; cada mejora es el id siguiente.
        sid = None
        if kind in ('learn', 'upgrade'):
            depth, cur = 0, r
            while tree_skills[cur['TreeSkillId']]['TypeID'] == 9:
                depth += 1
                cur = by_id[cur['ParentId1']]
            sid = ts['Param1'] + depth
        value = param_value(ts)
        node = {
            'id': str(r['ID']),
            'tree': r['TreeId'],
            'parents': [str(p) for p in (r['ParentId1'], r['ParentId2'], r['ParentId3']) if p != -1],
            'cost': r['NeedGp'],
            'x': r['PosX'],
            'y': r['PosY'],
            'name': both(ts['NameWordKey']),
            'desc': {k: fill(v, value) for k, v in both(ts['DescWordKey']).items()},
            'kind': kind,
            'strongest': bool(r['IsStrongestSkillFlag']),
            'quest': r['QuestId'] != -1,
        }
        if sid:
            node['skill'] = sid
        nodes.append(node)
        if sid and r['TreeId'] == 0:
            info = skill_info(sid)
            if info and sid not in [s['id'] for s in persona_skills]:
                info['node'] = node['id']
                persona_skills.append(info)

    guns = {}
    for w in weapons:
        if w['ID'] // 1000 != prefix or w['NameWordKey'] == 0 or ES.get(w['NameWordKey']) is None:
            continue
        base = w['ID'] // 10 * 10
        g = guns.setdefault(base, {'id': str(base), 'name': both(w['NameWordKey']), 'desc': both(w['DescWordKey']),
                                   'variants': [], 'recipe': None})
        s = skills.get(w['ActionSkillId'], {})
        g['variants'].append({
            'damage': [w['DamageMin'], w['DamageMax']],
            'range': s.get('Range'),
            'ailment': TYPES.get(s.get('AddEffectTypeParam1')) if s.get('AddEffectType1') == 1 else None,
            'ailmentRate': s.get('AddEffectActivationParam1') if s.get('AddEffectType1') == 1 else None,
        })
        m = recipes.get(base)
        if m:
            g['recipe'] = [{'type': TYPES[m['Terms1AttributeId']], 'level': m['Terms1Lv']},
                           {'type': TYPES[m['Terms2AttributeId']], 'level': m['Terms2Lv']}]
    out.append({
        'id': ES[c['CodeNameID']].lower(),
        'codename': both(c['CodeNameID']),
        'name': both(c['NameID']),
        'persona': both(personas[u['PersonaId']]['NameWordKey']) if u['PersonaId'] in personas else None,
        'stats': {'hp': u['HP'], 'sp': u['SP'], 'move': u['MoveRun']},
        'trees': [both(tree_names[(unit_id, t)]) for t in range(3) if (unit_id, t) in tree_names],
        'nodes': nodes,
        'personaSkills': persona_skills,
        'weapons': sorted(guns.values(), key=lambda g: (g['variants'][0]['damage'][0], g['id'])),
    })

json.dump(out, open(OUT / 'party.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
for m in out:
    print(m['id'], len(m['nodes']), 'nodos,', len(m['personaSkills']), 'habilidades,', len(m['weapons']), 'armas',
          sum(1 for n in m['nodes'] if '?' in (n['desc']['es'] or '')), 'sin valor')
