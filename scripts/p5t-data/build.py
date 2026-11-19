"""Datos de Persona 5 Tactica sacados de los archivos del juego (AssetStudio, ver README.md).

Uso: python3 build.py <carpeta MonoBehaviour exportada> <raíz del repo> [carpeta de imágenes Texture2D]
"""
import json
import sys
from pathlib import Path

RAW, ROOT = Path(sys.argv[1]), Path(sys.argv[2])
IMAGES = Path(sys.argv[3]) if len(sys.argv) > 3 else None
OUT = ROOT / 'src/games/p5t/data/generated'


def load(name):
    return json.load(open(RAW / name, encoding='utf-8-sig'))['param']


def words(name):
    return {w['Id']: w['Word'] for w in load(name)}


# Cada idioma tiene su word_database; se reconocen por el texto de Jack-o'-Lantern (14001).
WORDS = {}
for f in RAW.glob('word_database*.json'):
    w = words(f.name)
    text = w.get(14001, '')
    if text.startswith('A drunkard'):
        WORDS['en'] = w
    elif text.startswith('Un borracho'):
        WORDS['es'] = w
ES, EN = WORDS['es'], WORDS['en']

# Tipo (estado alterado) que hace de «arcana» en la fusión.
TYPES = {10: 'burn', 20: 'freeze', 30: 'sweep', 40: 'despair', 50: 'shock',
         60: 'vortex', 70: 'brainwash', 80: 'dizzy', 90: 'forget', 100: 'sleep'}
# Unlock: 1 = se habilita con una misión, 2 = Persona de otros juegos (legado),
# 101 = Pícaros de bonificación, 102 = DLC «Picaro Summoning Pack & Raoul».
UNLOCK = {0: None, 1: 'quest', 2: 'legacy', 101: 'bonus', 102: 'dlc'}

personas_raw = load('persona_ore_database.json')
effects = {e['Id']: e for e in load('persona_ore_effect_database.json')}
specials = {u['Id']: u for u in load('persona_ore_union_sp_database.json')}


def text(key):
    return {'es': ES.get(key), 'en': EN.get(key)}


def skill(eid):
    e = effects.get(eid)
    if not e:
        return None
    return {'nameEs': ES.get(e['NameWordKey']), 'nameEn': EN.get(e['NameWordKey']),
            'descEs': ES.get(e['DescWordKey']), 'descEn': EN.get(e['DescWordKey']),
            'rank': e['Worth'], 'inheritable': bool(e['Takeover'])}


types = {}
personas = []
for p in personas_raw:
    gid = p['Id']
    types[TYPES[p['AttributeId']]] = {'es': ES[p['AttributeWordKey']], 'en': EN[p['AttributeWordKey']]}
    sp = specials.get(gid)
    personas.append({
        'id': str(gid),
        'nameEs': ES[p['NameWordKey']],
        'nameEn': EN[p['NameWordKey']],
        'type': TYPES[p['AttributeId']],
        'level': p['InitLv'],
        'stats': {'hp': p['InitHp'], 'sp': p['InitSp'], 'melee': p['InitSword'], 'gun': p['InitGun']},
        'growth': {'hp': round(p['AddHp'], 2), 'sp': round(p['AddSp'], 2),
                   'melee': round(p['AddSword'], 2), 'gun': round(p['AddGun'], 2)},
        'unique': skill(gid),
        'inherited': skill(p['InheritanceSkillId']) if p['InheritanceSkillId'] else None,
        'normalFusion': bool(p['TwoUnion']),
        'unlock': UNLOCK[p['Unlock']],
        'special': [str(sp[f'Material{i}']) for i in range(1, 7) if sp[f'Material{i}']] if sp else None,
        'specialLocked': bool(sp['IsUnlock']) if sp else False,
        'mythEs': ES.get(p['DescWordKey']),
        'mythEn': EN.get(p['DescWordKey']),
    })

chart = {}
for u in load('persona_ore_union_database.json'):
    a, b, r = TYPES[u['Material1']], TYPES[u['Material2']], TYPES[u['Result']]
    chart.setdefault(a, {})[b] = r
    chart.setdefault(b, {})[a] = r

OUT.mkdir(parents=True, exist_ok=True)
json.dump(personas, open(OUT / 'personas.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
json.dump({'types': types, 'chart': chart}, open(OUT / 'fusion.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(personas), 'Personas,', sum(1 for p in personas if p['special']), 'especiales')

if IMAGES:
    from PIL import Image
    dst = ROOT / 'src/games/p5t/assets/personas'
    dst.mkdir(parents=True, exist_ok=True)
    for p in personas:
        src = IMAGES / f"persona_ore_{int(p['id']):03d}.png"
        if not src.exists():
            print('sin imagen:', p['id'], p['nameEn'])
            continue
        im = Image.open(src).convert('RGBA')
        im = im.crop(im.getbbox())
        im.thumbnail((440, 440), Image.LANCZOS)
        im.save(dst / f"{p['id']}.webp", 'WEBP', quality=78, method=6)
