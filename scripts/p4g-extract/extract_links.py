"""
Saca de los eventos de Social Link (event/eXX0/*.PM1) las preguntas y opciones oficiales, en español e inglés.
Uso: python3 -I extract_links.py <dir texto ES> <dir texto EN> [<dir extra EN> ...] <salida.json>
Los dirs extra (p. ej. la carpeta event del data.cpk base) completan los eventos que faltan en inglés.
"""
import glob
import json
import os
import sys

import pm1

FOLDERS = {
    'e550': 'magician', 'e540': 'priestess', 'e660': 'empress', 'e580': 'emperor', 'e560': 'hierophant',
    'e530': 'lovers', 'e590': 'chariot', 'e520': 'justice', 'e600': 'hermit', 'e610': 'fortune',
    'e620': 'strength', 'e630': 'strength', 'e640': 'hanged', 'e650': 'death', 'e720': 'temperance',
    'e570': 'devil', 'e680': 'tower', 'e690': 'star', 'e670': 'moon', 'e700': 'sun', 'e710': 'sun',
    'e740': 'aeon', 'e730': 'jester',
}
ME = '{P}'


def choices(items):
    out, last = [], None
    for it in items:
        if it[0] == 'msg':
            last = it
        elif last is not None:
            out.append({'speaker': '' if last[2] == ME else last[2], 'q': last[3][-1] if last[3] else '',
                        'opts': it[2]})
    return out


def find(roots, rel):
    for r in roots:
        p = os.path.join(r, rel)
        if os.path.exists(p):
            return p
    return None


def main():
    es_dir, en_dirs, out = sys.argv[1], sys.argv[2:-1], sys.argv[-1]
    en_roots = [os.path.join(en_dirs[0], 'event')] + en_dirs[1:]
    es_root = os.path.join(es_dir, 'event')
    res = {}
    for folder, arc in FOLDERS.items():
        names = set()
        for r in [es_root] + en_roots:
            names |= {os.path.basename(p) for p in glob.glob(os.path.join(r, folder, '*.PM*'))}
        evs = []
        for name in sorted(names):
            rel = os.path.join(folder, name)
            pes, pen = find([es_root], rel), find(en_roots, rel)
            ces = choices(pm1.bmd_items(open(pes, 'rb').read())) if pes else []
            cen = choices(pm1.bmd_items(open(pen, 'rb').read())) if pen else []
            if not ces and not cen:
                continue
            base = ces or cen
            ch = []
            for i, c in enumerate(base):
                e = cen[i] if i < len(cen) else None
                s = ces[i] if i < len(ces) else None
                ch.append({'speaker': (s or e)['speaker'], 'speakerEn': e['speaker'] if e else '',
                           'q': s['q'] if s else '', 'qEn': e['q'] if e else '',
                           'opts': s['opts'] if s else [], 'optsEn': e['opts'] if e else []})
            evs.append({'event': name.split('.')[0][1:], 'choices': ch})
        res.setdefault(arc, {})[folder] = evs
    json.dump(res, open(out, 'w'), ensure_ascii=False, indent=1)
    for arc, v in res.items():
        print(arc, {f: len(e) for f, e in v.items()})


main()
