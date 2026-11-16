"""
Preguntas de clase y exámenes de Persona 4 Golden (event/e470: E470/E471/E473 = clases, E474 = exámenes).
Cruza el texto oficial (ES y EN) con fechas y respuestas de la guía (classes-guide.txt).
Uso: python3 extract_classes.py <P4G-texto-ES> <P4G-texto-EN> <salida.json>
"""
import difflib
import glob
import json
import os
import re
import sys

import pm1

FRIENDS = {'Yosuke', 'Chie', 'Yukiko'}
norm = lambda s: re.sub(r'[^a-z0-9]', '', s.lower().replace('{p}', ''))


def sels(root):
    out = {}
    for f in sorted(glob.glob(os.path.join(root, 'event/e470/*.PM1'))):
        name = os.path.basename(f)[:8]
        prev = []
        for it in pm1.bmd_items(open(f, 'rb').read()):
            if it[0] == 'msg':
                prev.append(it)
                continue
            last = prev[-1] if prev else None
            # contexto: el último mensaje de un profesor antes de la pregunta (cuando la pregunta la hace un amigo)
            ctx = next((m for m in reversed(prev[:-1]) if m[2] and m[2] not in FRIENDS), None)
            out[(name, it[1])] = {'speaker': last[2] if last else '', 'q': last[3][-1] if last and last[3] else '',
                                  'ctx': ctx[3][-1] if ctx and ctx[3] else '', 'ctxSpeaker': ctx[2] if ctx else '',
                                  'opts': it[2]}
    return out


def ratio(a, b):
    return difflib.SequenceMatcher(None, norm(a), norm(b)).ratio()


def main():
    es, en = sels(sys.argv[1]), sels(sys.argv[2])
    guide = [l.rstrip('\n').split('|') for l in open(os.path.join(os.path.dirname(__file__), 'classes-guide.txt')) if l[0].isdigit()]
    used, out = set(), []
    for date, kind, gq, ga in guide:
        best, score = None, 0
        for key, s in en.items():
            if key in used or (kind == 'exam') != key[0].startswith('E474'):
                continue
            if not any(s['opts']):
                if ga.startswith('#') and 'kanji' in (s['q'] + gq).lower() and ratio(s['q'], gq) > 0.5:
                    pass
                elif not ga.startswith('#'):
                    continue
            hit = ga.startswith('#') or any(norm(o) == norm(ga) for o in s['opts'])
            if not hit:
                continue
            sc = max(ratio(s['q'], gq), ratio(s['ctx'], gq))
            if sc > score:
                best, score = key, sc
        if not best:
            print('sin cruzar', date, gq)
            continue
        used.add(best)
        s, e = en[best], es.get(best, en[best])
        ans = int(ga[1:]) if ga.startswith('#') else next(i for i, o in enumerate(s['opts']) if norm(o) == norm(ga))
        m, d = map(int, date.split('/'))
        friend = s['speaker'] in FRIENDS
        out.append({
            'month': m, 'day': d, 'kind': kind, 'askedBy': 'friend' if friend else 'teacher',
            'speaker': e['speaker'], 'speakerEn': s['speaker'],
            'q': e['q'], 'qEn': s['q'],
            'ctx': e['ctx'] if friend else '', 'ctxEn': s['ctx'] if friend else '',
            'ctxSpeaker': e['ctxSpeaker'] if friend else '', 'ctxSpeakerEn': s['ctxSpeaker'] if friend else '',
            'opts': e['opts'], 'optsEn': s['opts'], 'answer': ans,
        })
        if score < 0.5:
            print('dudoso', date, round(score, 2), gq, '→', s['q'][:60])
    json.dump({'source': 'Textos oficiales del juego (event/e470). Fechas y respuestas: RPG Site.', 'questions': out},
              open(sys.argv[3], 'w'), ensure_ascii=False, indent=1)
    print(len(out), 'preguntas')


main()
