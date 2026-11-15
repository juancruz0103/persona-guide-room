#!/usr/bin/env node
/**
 * Importa los datos de Persona 3 Reload desde aqiu384/megaten-fusion-tool
 * (Unlicense, dominio público) y les pone los nombres oficiales en español
 * sacados del juego (src/games/p3r/data/generated/names-es.json).
 *
 * Uso:
 *   git clone --depth 1 https://github.com/aqiu384/megaten-fusion-tool /tmp/aqiu
 *   node scripts/import-p3r/import.mjs /tmp/aqiu/src/app/p3r/data $(git -C /tmp/aqiu rev-parse HEAD)
 *
 * Solo se leen los archivos del juego base: los "aeg-*" (Episode Aigis) quedan afuera.
 * Este script lee únicamente archivos JSON: no ejecuta código de la fuente.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const srcDir = process.argv[2];
if (!srcDir) {
  console.error('Falta la carpeta de datos. Ej: node import.mjs /tmp/aqiu/src/app/p3r/data');
  process.exit(1);
}
const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, '../../src/games/p3r/data/generated');
const read = (f) => JSON.parse(readFileSync(join(srcDir, f), 'utf8'));
const names = JSON.parse(readFileSync(join(outDir, 'names-es.json'), 'utf8'));

const demons = read('demon-data.json');
const party = read('party-data.json');
const rawSkills = read('skill-data.json');
const chart = read('fusion-chart.json');
const special = read('special-recipes.json');
const unlocks = read('demon-unlocks.json');
const config = read('comp-config.json');
const warnings = [];

/* ---------- Mapeos ---------- */
// Orden de afinidades de la fuente: sla str pie fir ice ele win lig dar alm
const RESIST_ELEMS = ['sla', 'str', 'pie', 'fir', 'ice', 'ele', 'win', 'lig', 'dar', 'alm'];
const RESIST_CODE = {
  w: 'weak', z: 'weak', '-': 'neutral', _: 'neutral', u: 'neutral', v: 'neutral', V: 'neutral',
  s: 'resist', S: 'resist', t: 'resist', T: 'resist', n: 'null', r: 'repel', d: 'drain',
};
const TARGET = {
  '1 foe': 'one', 'All foes': 'all', '1 ally': 'ally', 'All allies': 'party', Party: 'party',
  'Rand allies': 'party', Universal: 'everyone', '-': 'self',
};
const AILMENTS = { Charm: 'charm', Poison: 'poison', Distress: 'distress', Confuse: 'confuse', Fear: 'fear', Rage: 'rage' };
const PARTY_OWNER = {
  Io: 'yukari', Isis: 'yukari', Hermes: 'junpei', Trismegistus: 'junpei', Polydeuces: 'akihiko', Caesar: 'akihiko',
  Penthesilea: 'mitsuru', Artemisia: 'mitsuru', Lucia: 'fuuka', Juno: 'fuuka', Palladion: 'aigis', Athena: 'aigis',
  Nemesis: 'ken', 'Kala-Nemi': 'ken', Cerberus: 'koromaru', Castor: 'shinjiro',
};

const slug = (n) =>
  n.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const arcanaId = (race) => race.replace(/ P$/, '').toLowerCase();

/** Nombre oficial en español. Variantes de la fuente ("Loki A", "Oracle B") usan el nombre base. */
function esName(table, en) {
  if (table[en]) return table[en];
  const base = en.replace(/ [A-Z]$/, '');
  if (table[base]) return table[base];
  if (en === 'Arsene' && table['Arsène']) return table['Arsène'];
  return null;
}

/* ---------- Skills ---------- */
const skills = {};
for (const row of Object.values(rawSkills)) {
  const [name, elem, target] = row.a;
  const [rank, cost] = row.b;
  const [ailText, , card] = row.c;
  if (/ [B-Z]$/.test(name) && rawSkills && rank === 0) continue; // variantes de enemigos
  const ailment = Object.keys(AILMENTS).find((a) => ailText.includes(a));
  skills[name] = {
    name,
    nameEs: esName(names.skills, name),
    element: elem === 'spe' ? 'sup' : elem,
    target: TARGET[target] ?? null,
    ailment: ailment ? AILMENTS[ailment] : null,
    cost: !cost ? null : cost < 1000 ? { type: 'hp', value: cost } : cost < 2000 ? { type: 'sp', value: cost - 1000 } : null,
    power: row.b[2] || null,
    unique: rank > 89,
    card: card !== '-' ? card : null,
  };
  if (!skills[name].nameEs && rank <= 89) warnings.push(`Skill sin nombre ES: ${name}`);
}

/* ---------- Desbloqueos ---------- */
const unlockOf = {};
for (const cat of unlocks) {
  for (const [p, cond] of Object.entries(cat.conditions)) {
    if (cat.category === 'Maxed Social Link') {
      const m = cond.match(/^(\w+) Rank 10$/);
      unlockOf[p] = m ? { type: 'link', arcana: m[1].toLowerCase() } : { type: 'allLinks' };
    } else if (cat.category === 'Maxed Teammate Link') {
      unlockOf[p] = { type: 'teammate', who: cond.replace(' Max Link', '').toLowerCase() };
    } else if (cat.category === 'Downloadable Content') {
      unlockOf[p] = { type: 'dlc', pack: cond };
    } else {
      const req = cond.match(/^Clear Elizabeth's Request #(\d+)$/);
      const floor = cond.match(/^(.+) (\d+)$/);
      unlockOf[p] = req ? { type: 'request', number: +req[1] } : floor ? { type: 'tartarus', block: floor[1], floor: +floor[2] } : { type: 'story', detail: cond };
    }
  }
}

/* ---------- Personas ---------- */
function convert(name, d, isParty) {
  const resistances = {};
  RESIST_ELEMS.forEach((el, i) => (resistances[el] = RESIST_CODE[d.resists[i]] ?? 'neutral'));
  const sk = Object.entries(d.skills).map(([skill, lv]) => ({
    skill,
    level: lv < 1 ? null : lv >= 1000 ? null : lv,
    ...(lv >= 1000 ? { note: 'special' } : {}),
  }));
  const [st, ma, en, ag, lu] = d.stats;
  const nameEs = esName(names.personas, name);
  if (!nameEs) warnings.push(`Persona sin nombre ES: ${name}`);
  const unlock = unlockOf[name] ?? null;
  return {
    id: slug(name),
    name,
    nameEs,
    arcana: arcanaId(d.race),
    level: d.lvl,
    flags: { dlc: unlock?.type === 'dlc', special: !!special[name] },
    specialRecipe: special[name] ?? null,
    unlock,
    resistances,
    stats: { st, ma, en, ag, lu },
    skills: sk,
    inheritance: d.inherits ?? null,
    heart: d.heart ? { item: d.heart, level: d.heartlvl } : null,
    ...(isParty ? { party: { owner: PARTY_OWNER[name] ?? null } } : {}),
  };
}
/** Evolución por historia: misma Persona con afinidades mejoradas ("sesists" en la fuente). */
const EVOLVES = {
  Io: 'Isis', Hermes: 'Trismegistus', Polydeuces: 'Caesar', Penthesilea: 'Artemisia',
  Lucia: 'Juno', Palladion: 'Athena', Nemesis: 'Kala-Nemi',
};
const partyList = Object.entries(party).flatMap(([n, d]) => {
  const base = convert(n, d, true);
  base.party.stage = 'initial';
  const evolved = EVOLVES[n];
  if (!evolved || !d.sesists) return [base];
  const evo = convert(evolved, { ...d, resists: d.sesists }, true);
  evo.party = { owner: base.party.owner, stage: 'evolved', baseId: base.id };
  base.party.evolvedId = evo.id;
  // La segunda Teúrgia (la última habilidad especial) se gana al evolucionar.
  // Shinjiro (Castor) no evoluciona, así que conserva las dos.
  const last = base.skills.map((s) => s.note).lastIndexOf('special');
  if (last >= 0) base.skills.splice(last, 1);
  return [base, evo];
});
const personas = [...Object.entries(demons).map(([n, d]) => convert(n, d, false)), ...partyList]
  .sort((a, b) => a.name.localeCompare(b.name));

/* ---------- Fusión ---------- */
const arcanaOrder = chart.races.map((r) => r.toLowerCase());
const table = {};
chart.races.forEach((ra, i) => {
  chart.table[i].forEach((res, j) => {
    if (res === '-' || i === j) return;
    const a = ra.toLowerCase(), b = chart.races[j].toLowerCase(), r = res.toLowerCase();
    (table[a] ??= {})[b] = r;
    (table[b] ??= {})[a] = r;
  });
});
const inheritTypes = Object.fromEntries(
  Object.entries(config.inheritTypes).map(([k, mask]) => [k, config.inheritElems.filter((_, i) => mask[i] === '1')]),
);

mkdirSync(outDir, { recursive: true });
const write = (file, data) => writeFileSync(join(outDir, file), JSON.stringify(data, null, 1) + '\n');
write('personas.json', personas);
write('skills.json', skills);
write('fusion.json', { arcanaOrder, chart: table, specialRecipes: special, inheritTypes });
write('meta.json', {
  source: 'https://github.com/aqiu384/megaten-fusion-tool',
  license: 'Unlicense (dominio público)',
  officialNames: 'Persona 3 Reload (texto del juego en español)',
  excluded: 'Episode Aigis (archivos aeg-*)',
  sourceCommit: process.argv[3] ?? null,
  importedAt: new Date().toISOString().slice(0, 10),
  counts: {
    personas: personas.filter((p) => !p.party).length,
    party: personas.filter((p) => p.party).length,
    dlc: personas.filter((p) => p.flags.dlc).length,
    special: personas.filter((p) => p.flags.special).length,
    skills: Object.keys(skills).length,
  },
  warnings,
});
console.log(`Personas: ${personas.length} · Skills: ${Object.keys(skills).length} · Avisos: ${warnings.length}`);
warnings.slice(0, 30).forEach((w) => console.log(' -', w));
