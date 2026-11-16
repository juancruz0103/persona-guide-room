"""
Lectura de archivos de Persona 4 Golden (PC) ya extraídos con CriFsLib.
Solo lee: nunca escribe en la carpeta del juego.

Formatos:
- BIN (init.bin, init_free.bin): nombre de 252 bytes + tamaño u32, alineado a 64.
- PAK v2 (datMsg.pak): cantidad u32 y entradas de 32 bytes de nombre + tamaño u32.
- MSG.TBL: secciones (u32 tamaño + datos, alineadas a 16) con nombres de ancho fijo.
- BMD (little endian): mensajes de ayuda.
- Texto en español: las letras con tilde van como 0x9C + un byte.
"""
import struct

ESMAP = {
    0xa3: ' ', 0xa4: '¡', 0xba: '¿', 0xbc: 'Á', 0xc8: 'Í', 0xd4: 'Ú', 0xdb: 'á', 0xe3: 'é',
    0xe7: 'í', 0xeb: 'ñ', 0xed: 'ó', 0xf3: 'ú', 0xf5: 'ü', 0xc4: 'É', 0xa8: 'ª', 0xe4: 'ê',
}
unknown = set()


def dec(b: bytes) -> str:
    out, i = [], 0
    while i < len(b):
        c = b[i]
        if c == 0x9c and i + 1 < len(b):
            ch = ESMAP.get(b[i + 1])
            if ch is None:
                unknown.add(b[i + 1])
                ch = '?'
            out.append(ch)
            i += 2
        elif c >= 0x80 and i + 1 < len(b):
            pair = (c, b[i + 1])
            if pair == (0x80, 0x80):  # nombre del protagonista
                out.append('{P}')
            else:
                unknown.add(pair)
            i += 2
        else:
            out.append(chr(c))
            i += 1
    return ''.join(out)


def u32(b, o):
    return struct.unpack_from('<I', b, o)[0]


def bin_archive(b: bytes) -> dict:
    off, out = 0, {}
    while off + 256 <= len(b):
        name = b[off:off + 252].split(b'\0')[0]
        if not name:
            break
        size = u32(b, off + 252)
        out[name.decode('latin1')] = b[off + 256:off + 256 + size]
        off = (off + 256 + size + 63) // 64 * 64
    return out


def pak2(b: bytes) -> dict:
    n, off, out = u32(b, 0), 4, {}
    for _ in range(n):
        name = b[off:off + 32].split(b'\0')[0].decode('latin1')
        size = u32(b, off + 32)
        out[name] = b[off + 36:off + 36 + size]
        off += 36 + size
    return out


def sections(b: bytes) -> list:
    off, out = 0, []
    while off < len(b):
        size = u32(b, off)
        out.append(b[off + 4:off + 4 + size])
        off = (off + 4 + size + 15) // 16 * 16
    return out


def fixed(b: bytes, width: int) -> list:
    return [dec(b[i:i + width].split(b'\0')[0]) for i in range(0, len(b), width)]


def page_text(t: bytes) -> str:
    out, i = bytearray(), 0
    while i < len(t):
        c = t[i]
        if c == 0:
            break
        if t[i:i + 2] == b'\xf1\x82':  # función que escribe el nombre del protagonista
            out += b'\x80\x80'
            i += 2
            continue
        if c & 0xF0 == 0xF0:  # función de script: (c & 0x0F) * 2 bytes en total
            i += max(2, (c & 0x0F) * 2)
            continue
        if c >= 0x80:  # carácter de 2 bytes (tildes 0x9C xx, nombre del protagonista 0x80 0x80, etc.)
            out += t[i:i + 2]
            i += 2
            continue
        out.append(c)
        i += 1
    return dec(bytes(out)).strip()


def bmd(b: bytes) -> dict:
    n, res = u32(b, 0x18), {}
    for k in range(n):
        typ, off = u32(b, 0x20 + k * 8), u32(b, 0x24 + k * 8) + 0x20
        name = b[off:off + 24].split(b'\0')[0].decode('latin1')
        if typ != 0:
            continue
        pages = struct.unpack_from('<H', b, off + 24)[0]
        offs = [u32(b, off + 28 + 4 * j) + 0x20 for j in range(pages)]
        end = off + 32 + 4 * pages + u32(b, off + 28 + 4 * pages)
        res[name] = [page_text(b[o:(offs[j + 1] if j + 1 < pages else end)]) for j, o in enumerate(offs)]
    return res
