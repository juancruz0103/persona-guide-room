"""
Lector mínimo de scripts de flujo (.bf, 'FLW0') de Persona 4 Golden.
Secciones: 0 procedimientos, 1 etiquetas, 2 instrucciones, 3 mensajes (BMD), 4 textos.
Cada instrucción: u16 opcode + u16 operando; PUSHI y PUSHF llevan el valor en las 4 bytes siguientes.
"""
import struct

import p4g

OPS = ['PUSHI', 'PUSHF', 'PUSHIX', 'PUSHIF', 'PUSHREG', 'POPIX', 'POPFX', 'PROC', 'COMM', 'END', 'JUMP', 'CALL', 'RUN',
       'GOTO', 'ADD', 'SUB', 'MUL', 'DIV', 'MINUS', 'NOT', 'OR', 'AND', 'EQ', 'NEQ', 'S', 'L', 'SE', 'LE', 'IF', 'PUSHIS',
       'PUSHLIX', 'PUSHLFX', 'POPLIX', 'POPLFX', 'PUSHSTR']


def sections(b):
    n = struct.unpack_from('<I', b, 0x10)[0]
    out = {}
    for i in range(n):
        t, es, c, o = struct.unpack_from('<IIII', b, 0x20 + i * 16)
        out[t] = (es, c, o)
    return out


def read(b):
    s = sections(b)
    es, c, o = s[0]
    procs = []
    for i in range(c):
        name = b[o + i * es:o + i * es + 24].split(b'\0')[0].decode('latin1')
        off = struct.unpack_from('<I', b, o + i * es + 24)[0]
        procs.append((name, off))
    es, c, o = s[1]
    labels = []
    for i in range(c):
        name = b[o + i * es:o + i * es + 24].split(b'\0')[0].decode('latin1')
        off = struct.unpack_from('<I', b, o + i * es + 24)[0]
        labels.append((name, off))
    es, c, o = s[2]
    ins, i = [], 0
    while i < c:
        op, arg = struct.unpack_from('<HH', b, o + i * 4)
        if op in (0, 1):
            val = struct.unpack_from('<i' if op == 0 else '<f', b, o + (i + 1) * 4)[0]
            ins.append((i, OPS[op], val))
            i += 2
            continue
        ins.append((i, OPS[op] if op < len(OPS) else f'OP{op}', arg if arg < 0x8000 else arg - 0x10000))
        i += 1
    es, c, o = s[3]
    msgs = p4g.bmd(b[o:o + c]) if c else {}
    names = list(_msg_names(b[o:o + c])) if c else []
    return {'procs': procs, 'labels': labels, 'ins': ins, 'msgs': msgs, 'msgOrder': names}


def _msg_names(m):
    n = p4g.u32(m, 0x18)
    for k in range(n):
        typ, off = p4g.u32(m, 0x20 + k * 8), p4g.u32(m, 0x24 + k * 8) + 0x20
        name = m[off:off + 24].split(b'\0')[0].decode('latin1')
        if typ == 0:
            yield ('msg', name)
        else:
            cnt = struct.unpack_from('<H', m, off + 26)[0]
            offs = [p4g.u32(m, off + 32 + 4 * j) + 0x20 for j in range(cnt)]
            opts = []
            for j, oo in enumerate(offs):
                end = offs[j + 1] if j + 1 < cnt else len(m)
                opts.append(p4g.page_text(m[oo:end]))
            yield ('sel', name, opts)
