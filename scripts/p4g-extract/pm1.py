"""
Lee los mensajes (BMD) que trae cada evento .PM1 de Persona 4 Golden, en orden:
('msg', nombre, hablante, [páginas]) y ('sel', nombre, [opciones]).
"""
import struct

import p4g

u32 = p4g.u32


def bmd_items(b: bytes):
    i = b.find(b'MSG1')
    if i < 8:
        return []
    m = b[i - 8:]
    n = u32(m, 0x18)
    sp_off, sp_n = u32(m, 0x20 + n * 8) + 0x20, u32(m, 0x24 + n * 8)
    speakers = []
    for k in range(sp_n):
        o = u32(m, sp_off + 4 * k) + 0x20
        speakers.append(p4g.page_text(m[o:o + 64]))
    out = []
    for k in range(n):
        typ, off = u32(m, 0x20 + k * 8), u32(m, 0x24 + k * 8) + 0x20
        name = m[off:off + 24].split(b'\0')[0].decode('latin1')
        if typ == 0:
            pages, sp = struct.unpack_from('<HH', m, off + 24)
            offs = [u32(m, off + 28 + 4 * j) + 0x20 for j in range(pages)]
            end = off + 32 + 4 * pages + u32(m, off + 28 + 4 * pages)
            txt = [p4g.page_text(m[o:(offs[j + 1] if j + 1 < pages else end)]) for j, o in enumerate(offs)]
            out.append(('msg', name, speakers[sp] if sp < len(speakers) else '', txt))
        else:
            cnt = struct.unpack_from('<H', m, off + 26)[0]
            offs = [u32(m, off + 32 + 4 * j) + 0x20 for j in range(cnt)]
            opts = [p4g.page_text(m[o:(offs[j + 1] if j + 1 < cnt else len(m))]) for j, o in enumerate(offs)]
            out.append(('sel', name, opts))
    return out
