"""Lee los chats del teléfono de Royal (CAMP/CHAT/SCRIPTCHAT_*.BF): script + BMD incrustado (big endian)."""
import os
import struct
import sys

sys.path.insert(0, os.path.dirname(__file__))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'import-confidants'))
import bf5  # noqa: E402
from extract import page_text  # noqa: E402


def bmd_items(d):
    e = '>'  # el encabezado dice 1GSM pero los datos son big endian
    n = struct.unpack(e + 'I', d[0x18:0x1c])[0]
    out = []
    for k in range(n):
        typ, off = struct.unpack(e + 'II', d[0x20 + k * 8:0x28 + k * 8]); p = off + 0x20
        name = d[p:p + 24].split(b'\0')[0].decode('latin1')
        if typ == 0:
            pages = struct.unpack(e + 'H', d[p + 24:p + 26])[0]
            offs = struct.unpack(e + 'I' * pages, d[p + 28:p + 28 + 4 * pages])
            size = struct.unpack(e + 'I', d[p + 28 + 4 * pages:p + 32 + 4 * pages])[0]
            raw = d[offs[0] + 0x20:p + 32 + 4 * pages + size] if pages else b''
            out.append(('m', name, page_text(raw), raw))
        else:
            cnt = struct.unpack(e + 'H', d[p + 26:p + 28])[0]
            offs = struct.unpack(e + 'I' * cnt, d[p + 32:p + 32 + 4 * cnt])
            out.append(('s', name, [page_text(d[o + 0x20:]) for o in offs], None))
    return out


def read(path):
    b = open(path, 'rb').read()
    r = bf5.read(b)
    es, c, o = r['sec'][3]
    r['bmd'] = bmd_items(b[o:o + c]) if c else []
    return r
