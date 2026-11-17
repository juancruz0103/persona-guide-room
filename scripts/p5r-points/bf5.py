"""Lector de flowscripts (.BF) de Persona 5 Royal (big endian). Igual que P4G pero con nombres de 32 bytes."""
import struct

OPS = ['PUSHI', 'PUSHF', 'PUSHIX', 'PUSHIF', 'PUSHREG', 'POPIX', 'POPFX', 'PROC', 'COMM', 'END', 'JUMP', 'CALL', 'RUN',
       'GOTO', 'ADD', 'SUB', 'MUL', 'DIV', 'MINUS', 'NOT', 'OR', 'AND', 'EQ', 'NEQ', 'S', 'L', 'SE', 'LE', 'IF', 'PUSHIS',
       'PUSHLIX', 'PUSHLFX', 'POPLIX', 'POPLFX', 'PUSHSTR']


def read(b):
    n = struct.unpack_from('>I', b, 0x10)[0]
    sec = {}
    for i in range(n):
        t, es, c, o = struct.unpack_from('>IIII', b, 0x20 + i * 16)
        sec[t] = (es, c, o)
    def names(t):
        es, c, o = sec[t]
        return [(b[o + i * es:o + i * es + es - 8].split(b'\0')[0].decode('latin1'), struct.unpack_from('>I', b, o + i * es + es - 8)[0]) for i in range(c)]
    procs, labels = names(0), names(1)
    es, c, o = sec[2]
    ins, i = [], 0
    while i < c:
        op, arg = struct.unpack_from('>Hh', b, o + i * 4)
        if op in (0, 1):
            val = struct.unpack_from('>i' if op == 0 else '>f', b, o + (i + 1) * 4)[0]
            ins.append((i, OPS[op], val)); i += 2; continue
        ins.append((i, OPS[op] if op < len(OPS) else f'OP{op}', arg)); i += 1
    return {'procs': procs, 'labels': labels, 'ins': ins, 'sec': sec}
