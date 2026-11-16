#!/usr/bin/env python3
"""
Saca del juego los nombres oficiales (español e inglés) y las descripciones
de habilidades de Persona 4 Golden.

Uso: python3 -I extract_text.py <carpeta P4G-texto-ES> <carpeta P4G-texto-EN> <salida.json>
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import p4g  # noqa: E402

# Ancho fijo de cada tabla de nombres en MSG.TBL (español usa nombres más largos).
WIDTH = {'en': {'skills': 23}, 'es': {'skills': 33}}


def read(lang, folder):
    with open(os.path.join(folder, 'init_free.bin'), 'rb') as f:
        free = p4g.bin_archive(f.read())
    with open(os.path.join(folder, 'init.bin'), 'rb') as f:
        init = p4g.bin_archive(f.read())
    s = p4g.sections(free['battle/MSG.TBL'])
    msgs = p4g.pak2(init['init/datMsg.pak'])
    help_ = p4g.bmd(msgs['datSkillHelp.bmd'])
    cards = p4g.bmd(msgs['datSkillCardHelp.bmd'])
    return {
        'cards': [' '.join(v).replace('\n', ' ') for k, v in cards.items()],
        'arcana': p4g.fixed(s[0], 21),
        'skills': p4g.fixed(s[1], WIDTH[lang]['skills']),
        'personas': p4g.fixed(s[3], 21),
        'skillHelp': {int(k.split('_')[1], 16): ' '.join(v).replace('\n', ' ').strip() for k, v in help_.items() if k.startswith('skill_')},
    }


def main():
    es_dir, en_dir, out = sys.argv[1:4]
    es, en = read('es', es_dir), read('en', en_dir)
    data = {
        'arcana': [{'en': a, 'es': b} for a, b in zip(en['arcana'], es['arcana'])],
        'personas': [{'id': i, 'en': a, 'es': b} for i, (a, b) in enumerate(zip(en['personas'], es['personas'])) if a and a != '0' and a != 'blank'],
        'skills': [{'id': i, 'en': a, 'es': b} for i, (a, b) in enumerate(zip(en['skills'], es['skills'])) if a],
        'skillHelp': {i: {'en': en['skillHelp'].get(i, ''), 'es': es['skillHelp'].get(i, '')} for i in sorted(set(en['skillHelp']) | set(es['skillHelp']))},
        # Habilidades que existen como skill card (texto: "Skill Card that bestows X.")
        'skillCards': [m.group(1).strip().rstrip('.') for t in en['cards'] if (m := re.search(r'bestows\s+(.+?)\.?$', t))],
    }
    with open(out, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
        f.write('\n')
    print('personas', len(data['personas']), 'skills', len(data['skills']), 'ayudas', len(data['skillHelp']))
    if p4g.unknown:
        print('Letras sin traducir:', sorted(hex(x) for x in p4g.unknown))


if __name__ == '__main__':
    main()
