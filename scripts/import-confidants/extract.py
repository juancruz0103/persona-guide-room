#!/usr/bin/env python3
"""
Extrae las elecciones (SEL) de los eventos de confidentes del juego.

Uso: python3 extract.py <carpeta E700 español> <carpeta E700 inglés> <salida.json>
(las carpetas EVENT_DATA/MESSAGE/E700 de ES.CPK y EN.CPK, extraídas con CriFsLib)

Archivo E7AA_RRx.BMD: AA = número de evento del confidente, RR = rango.
Para cada elección guarda la frase anterior (lo que dice el confidente) y las opciones.
"""
import json, os, re, struct, sys

SPECIAL = {0x1db: '¡', 0x1e3: 'ª', 0x1e4: '«', 0x1f1: '»', 0x1f5: '¿'}

def decode(b):
    out, i = '', 0
    while i < len(b):
        c = b[i]
        if c < 0x80:
            out += chr(c); i += 1; continue
        lo = b[i + 1]; i += 2
        idx = (c - 0x80) * 128 + (lo - 0x80)
        if c == 0x80 and lo >= 0xa0: out += chr(lo - 0x60)
        elif idx in SPECIAL: out += SPECIAL[idx]
        elif 0x1f6 <= idx <= 0x233:
            cp = 0xc0 + idx - 0x1f6
            if cp >= 0xd7: cp += 1
            if cp >= 0xf7: cp += 1
            out += chr(cp)
        else: out += '�'
    return out

def page_text(b):
    out, i = bytearray(), 0
    while i < len(b):
        c = b[i]
        if c == 0: break
        if c & 0xF0 == 0xF0:
            i += 2 + max((c & 0x0F) * 2 - 2, 0); continue
        if c >= 0x80: out += b[i:i + 2]; i += 2; continue
        out.append(c); i += 1
    return re.sub(r'\s+', ' ', decode(bytes(out))).strip()

def parse(path):
    d = open(path, 'rb').read()
    n = struct.unpack('>I', d[0x18:0x1c])[0]
    res = {}
    for k in range(n):
        typ, off = struct.unpack('>II', d[0x20 + k * 8:0x28 + k * 8]); p = off + 0x20
        name = d[p:p + 24].split(b'\0')[0].decode()
        if typ == 0:
            pages = struct.unpack('>H', d[p + 24:p + 26])[0]
            offs = struct.unpack('>' + 'I' * pages, d[p + 28:p + 28 + 4 * pages])
            size = struct.unpack('>I', d[p + 28 + 4 * pages:p + 32 + 4 * pages])[0]
            end = p + 32 + 4 * pages + size
            res[name] = [page_text(d[o + 0x20:(offs[j + 1] + 0x20) if j + 1 < pages else end]) for j, o in enumerate(offs)]
        else:
            cnt = struct.unpack('>H', d[p + 26:p + 28])[0]
            offs = struct.unpack('>' + 'I' * cnt, d[p + 32:p + 32 + 4 * cnt])
            res[name] = ['SEL'] + [page_text(d[o + 0x20:]) for o in offs]
    return res

EVENTS = {'makoto': 'E702', 'haru': 'E703', 'yusuke': 'E704', 'sojiro': 'E705', 'ann': 'E706', 'ryuji': 'E707',
          'futaba': 'E709', 'chihaya': 'E710', 'iwai': 'E712', 'takemi': 'E713', 'kawakami': 'E714', 'ohya': 'E715',
          'oda': 'E716', 'hifumi': 'E717', 'mishima': 'E718', 'yoshida': 'E719', 'kasumi': 'E722', 'maruki': 'E723',
          'akechi': 'E726', 'caroline-justine': 'E729'}

def main(es_dir, en_dir, out_path):
    out = {}
    for cid, code in EVENTS.items():
        ranks = {}
        for f in sorted(os.listdir(en_dir)):
            if not f.startswith(code + '_'): continue
            suf = f[5:8]
            if suf[0] == '3': continue  # quedadas (no son de rango)
            key = 'royal' if suf[0] == '2' else ('10' if suf[0] == '1' else str(int(suf[1])))
            en, es = parse(os.path.join(en_dir, f)), parse(os.path.join(es_dir, f))
            keys = list(en)
            for i, k in enumerate(keys):
                if not k.startswith('SEL'): continue
                prev = keys[i - 1] if i else None
                prompt = lambda m: m[prev][-1] if prev and m.get(prev) and m[prev][0] != 'SEL' else ''
                ranks.setdefault(key, []).append({
                    'file': f[:-4], 'key': k, 'prompt': {'es': prompt(es), 'en': prompt(en)},
                    'options': [{'es': a, 'en': b} for a, b in zip(es[k][1:], en[k][1:])],
                })
        out[cid] = ranks
    json.dump(out, open(out_path, 'w'), ensure_ascii=False, indent=1)

if __name__ == '__main__':
    main(*sys.argv[1:4])
