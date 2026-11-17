"""
Objetos clave que dan los vínculos al rango máximo (eventitem 0x4A0–0x4B3): nombre y descripción oficiales en ES y EN.
Uso: python3 extract_link_items.py <P4G-texto-ES> <P4G-texto-EN> <salida.json>
"""
import json
import sys

import p4g
import pm1


def load(root):
    v = p4g.sections(p4g.bin_archive(open(f'{root}/init_free.bin', 'rb').read())['init/itemtbl.bin'])[2]
    help_ = p4g.pak2(p4g.bin_archive(open(f'{root}/init.bin', 'rb').read())['init/datMsg.pak'])['datEventItemHelp.bmd']
    desc = {int(x[1].split('_')[1], 16): ' '.join(x[3]).replace('\n', ' ') for x in pm1.bmd_items(help_) if x[0] == 'msg'}
    return v, desc


def main():
    (es, des), (en, den) = load(sys.argv[1]), load(sys.argv[2])
    # Los nombres de los objetos clave están al final de la tabla (EN: 24 bytes, ES: 28 bytes por nombre).
    k = (len(en) - en.find(b"Buddy's Bandage\0")) // 24
    out = {}
    for n in range(0x4A0, 0x4B4):
        i = k - (n - 0x4A0)
        name_en = p4g.dec(en[len(en) - i * 24:len(en) - i * 24 + 24].split(b'\0')[0])
        name_es = p4g.dec(es[len(es) - i * 28:len(es) - i * 28 + 28].split(b'\0')[0])
        out[f'{n:X}'] = {'es': name_es, 'en': name_en, 'descEs': des.get(n, ''), 'descEn': den.get(n, '')}
    json.dump(out, open(sys.argv[3], 'w'), ensure_ascii=False, indent=1)
    for key, v in out.items():
        print(key, v['es'], '|', v['en'], '|', v['descEs'][:70])


main()
