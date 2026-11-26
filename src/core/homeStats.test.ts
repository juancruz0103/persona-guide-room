import { describe, expect, it } from 'vitest';
import { HOME_STATS } from './homeStats';
import * as r from '../games/p5r/services/personas';
import { CONFIDANTS } from '../games/p5r/services/confidants';
import * as p4 from '../games/p4g/services/personas';
import * as p4r from '../games/p4r/services/personas';
import * as p3 from '../games/p3r/services/personas';
import * as t from '../games/p5t/services/personas';
import * as s from '../games/p5s/services/personas';
import * as o from '../games/p5/services/personas';

describe('números de las portadas', () => {
  it('coinciden con los datos', () => {
    const a4 = p4.getAllPersonas();
    const a3 = p3.getAllPersonas();
    const a4r = p4r.getAllPersonas();
    const at = t.getAllPersonas();
    const as = s.getAllPersonas();
    const ao = o.getAllPersonas();
    expect(HOME_STATS).toEqual({
      p5r: { personas: r.getAllPersonas().length, thieves: CONFIDANTS.filter((c) => c.phantomThief).length },
      p4g: { personas: a4.filter((p) => !p.party).length, special: a4.filter((p) => p.flags.special).length, arcana: new Set(a4.map((p) => p.arcana)).size },
      p4r: { personas: a4r.filter((p) => !p.party).length, special: a4r.filter((p) => p.flags.special).length, arcana: new Set(a4r.map((p) => p.arcana)).size },
      p3r: { personas: a3.filter((p) => !p.party).length, special: a3.filter((p) => p.flags.special).length },
      p5t: { personas: at.filter((p) => !t.isDlc(p)).length, special: at.filter((p) => p.special).length, dlc: at.filter(t.isDlc).length },
      p5s: { personas: as.filter((p) => !p.party).length, special: as.filter((p) => p.special).length, party: as.filter((p) => p.party).length },
      p5: { personas: ao.length, special: ao.filter((p) => p.flags.special).length, party: o.getPartyPersonas().length },
    });
  });
});
