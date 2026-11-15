import struct, json, sys
BASE=0x20
def u32(b,o): return struct.unpack_from('>I',b,o)[0]
def u16(b,o): return struct.unpack_from('>H',b,o)[0]
def decode(b, start, end):
    out=[]; i=start; buf=bytearray()
    def flush():
        if buf: out.append(buf.decode('utf-8','replace')); buf.clear()
    while i<end:
        c=b[i]
        if c==0: i+=1; continue
        if c==0x0A: buf.extend(b'\n'); i+=1; continue
        if c==0xFE:
            ln=(b[i+1] & 0x0F)*2
            flush()
            fb=b[i+1:i+1+ln]
            out.append({'f':fb.hex()})
            i+=1+ln; continue
        buf.append(c); i+=1
    flush(); return out
def parse(b):
    n=u32(b,0x18)
    hdrs=[(u32(b,0x20+k*8),u32(b,0x24+k*8)) for k in range(n)]
    spk=0x20+n*8
    sp_off,sp_cnt=u32(b,spk),u32(b,spk+4)
    speakers=[]
    for k in range(sp_cnt):
        o=u32(b,BASE+sp_off+k*4)+BASE
        e=b.index(b'\0',o); speakers.append(b[o:e].decode('utf-8','replace'))
    dialogs=[]
    for kind,off in hdrs:
        o=off+BASE
        name=b[o:o+24].split(b'\0')[0].decode()
        if kind==0:
            pc,spid=u16(b,o+24),u16(b,o+26)
            pages=[u32(b,o+28+4*p)+BASE for p in range(pc)]
            tsize=u32(b,o+28+4*pc); tstart=o+32+4*pc
            ends=pages[1:]+[tstart+tsize]
            dialogs.append({'kind':'msg','name':name,'speaker':(speakers[spid] if spid<len(speakers) else spid),
                            'pages':[decode(b,p,e) for p,e in zip(pages,ends)]})
        else:
            oc=u16(b,o+26)
            opts=[u32(b,o+32+4*p)+BASE for p in range(oc)]
            tsize=u32(b,o+32+4*oc); tstart=o+36+4*oc
            ends=opts[1:]+[tstart+tsize]
            dialogs.append({'kind':'sel','name':name,'options':[decode(b,p,e) for p,e in zip(opts,ends)]})
    return dialogs
def text(parts): return ''.join(p for p in parts if isinstance(p,str))
if __name__=='__main__':
    b=open(sys.argv[1],'rb').read()
    for dl in parse(b)[:40]:
        if dl['kind']=='msg': print(dl['name'],'|',dl['speaker'],'|',' / '.join(text(p).replace('\n',' ') for p in dl['pages'])[:160])
        else: print(dl['name'],'SEL',[text(p) for p in dl['options']])
