#!/usr/bin/env node
/**
 * Importa los datos de Persona 4 Golden desde aqiu384/megaten-fusion-tool
 * (Unlicense, dominio público) y les pone los nombres oficiales en español e
 * inglés sacados del juego (src/games/p4g/data/generated/game-text.json,
 * generado por scripts/p4g-extract/extract_text.py).
 *
 * Uso:
 *   git clone --depth 1 https://github.com/aqiu384/megaten-fusion-tool /tmp/aqiu
 *   node scripts/import-p4g/import.mjs /tmp/aqiu/src/app/p4/data $(git -C /tmp/aqiu rev-parse HEAD)
 *
 * Usa los archivos "golden-*" (contenido de P4G) con los del P4 original como base.
 * Este script lee únicamente archivos JSON: no ejecuta código de la fuente.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const srcDir = process.argv[2];
if (!srcDir) {
  console.error('Falta la carpeta de datos. Ej: node import.mjs /tmp/aqiu/src/app/p4/data');
  process.exit(1);
}
const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, '../../src/games/p4g/data/generated');
const read = (f) => JSON.parse(readFileSync(join(srcDir, f), 'utf8'));
const game = JSON.parse(readFileSync(join(outDir, 'game-text.json'), 'utf8'));
const warnings = [];

const demons = { ...read('demon-data.json'), ...read('golden-demon-data.json') };
const party = read('golden-party-data.json');
const rawSkills = { ...read('skill-data.json'), ...read('golden-skill-data.json') };
const chart = read('golden-fusion-chart.json');
const special = read('special-recipes.json');
const unlocks = read('golden-demon-unlocks.json');
const inherit = read('inheritance-types.json');

/* ---------- Nombres oficiales del juego ---------- */
const norm = (s) => s.toLowerCase().replace(/[^a-z]/g, '');
const gamePersona = new Map();
for (const p of game.personas) if (!gamePersona.has(norm(p.en))) gamePersona.set(norm(p.en), p);
// La fuente y el juego escriben distinto algunos nombres.
const PERSONA_ALIAS = {
  Andras: 'Andra', 'Hitokoto-Nushi': 'Hitokotonusi', 'Kushinada-Hime': 'Kushinada', Lakshmi: 'Laksmi',
  Okuninushi: 'Oukuninushi', Seiryu: 'Seiryuu', 'Yomotsu-Ikusa': 'Ikusa',
};
const officialPersona = (name) => gamePersona.get(norm(PERSONA_ALIAS[name] ?? name)) ?? null;
const gameSkill = new Map(game.skills.map((s) => [s.id, s]));

/* ---------- Mapeos ---------- */
const RESIST_ELEMS = ['phy', 'fir', 'ice', 'ele', 'win', 'lig', 'dar', 'alm'];
const RESIST_CODE = { w: 'weak', Z: 'weak', '-': 'neutral', s: 'resist', S: 'resist', T: 'resist', n: 'null', N: 'null', r: 'repel', d: 'drain' };
const TARGET = {
  '1 foe': 'one', 'All foes': 'all', '1 ally': 'ally', 'All allies': 'party', Party: 'party', Universal: 'everyone', '-': 'self',
};
const AILMENTS = ['Panic', 'Poison', 'Fear', 'Rage', 'Dizzy', 'Exhaustion', 'Enervation', 'Mute', 'Confusion'];
const PARTY = {
  Jiraiya: { owner: 'yosuke', forms: ['Susano-o', 'Takehaya Susano-o'] },
  Tomoe: { owner: 'chie', forms: ['Suzuka Gongen', 'Haraedo-no-Okami'] },
  'Konohana Sakuya': { owner: 'yukiko', forms: ['Amaterasu', 'Sumeo-Okami'] },
  'Take-Mikazuchi': { owner: 'kanji', forms: ['Rokuten Maoh', 'Takeji Zaiten'] },
  Himiko: { owner: 'rise', forms: ['Kanzeon', 'Kouzeon'] },
  'Kintoki-Douji': { owner: 'teddie', forms: ['Kamui', 'Kamui-Moshiri'] },
  'Sukuna-Hikona': { owner: 'naoto', forms: ['Yamato-Takeru', 'Yamato-Sumeragi'] },
};

const slug = (n) => n.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const arcanaId = (race) => race.replace(/ P$/, '').toLowerCase();

/* ---------- Skills ---------- */
const skills = {};
for (const [id, row] of Object.entries(rawSkills)) {
  const [name, elem, target] = row.a;
  const [rank, cost, power] = row.b;
  if (/ [B-Z]$/.test(name) || rank === 0 && !gameSkill.get(+id)) continue; // variantes de enemigos
  const g = gameSkill.get(+id);
  const ailment = AILMENTS.find((a) => (row.c[0] ?? '').includes(a)) ?? null;
  skills[name] = {
    id: +id,
    name,
    nameEn: g?.en ?? name,
    nameEs: g?.es ?? null,
    element: elem === 'spe' ? 'sup' : elem,
    target: TARGET[target] ?? null,
    ailment: ailment ? ailment.toLowerCase() : null,
    cost: !cost ? null : cost < 1000 ? { type: 'hp', value: cost } : cost < 2000 ? { type: 'sp', value: cost - 1000 } : null,
    power: power || null,
    rank: rank || null,
    unique: rank > 89,
  };
  if (!g) warnings.push(`Skill sin nombre del juego: ${name} (${id})`);
}

/* ---------- Desbloqueos ---------- */
const unlockOf = {};
for (const cat of unlocks) {
  for (const [p, cond] of Object.entries(cat.conditions)) {
    const m = cond.match(/^(\w+) Rank 10$/);
    unlockOf[p] = m ? { type: 'link', arcana: m[1].toLowerCase() } : { type: 'story', detail: cond };
  }
}

/* ---------- Personas ---------- */
function convert(name, d, resists, extra = {}) {
  const resistances = {};
  RESIST_ELEMS.forEach((el, i) => (resistances[el] = RESIST_CODE[resists[i]] ?? 'neutral'));
  const sk = Object.entries(d.skills).map(([skill, lv]) => ({
    skill,
    level: lv < 1 ? null : lv >= 1000 ? null : lv,
    ...(lv >= 1000 ? { note: 'special' } : {}),
  }));
  for (const s of sk) if (!skills[s.skill]) warnings.push(`Skill desconocida en ${name}: ${s.skill}`);
  const [st, ma, en, ag, lu] = d.stats;
  const g = officialPersona(name);
  if (!g) warnings.push(`Persona sin nombre del juego: ${name}`);
  const unlock = unlockOf[name] ?? null;
  return {
    id: slug(name),
    gameId: g?.id ?? null,
    name,
    nameEn: g?.en ?? name,
    nameEs: g?.es ?? null,
    arcana: arcanaId(d.race),
    level: d.lvl,
    flags: { special: !!special[name] },
    specialRecipe: special[name] ?? null,
    unlock,
    resistances,
    stats: { st, ma, en, ag, lu },
    skills: sk,
    inheritance: d.inherits ?? null,
    ...extra,
  };
}
const partyList = Object.entries(party).flatMap(([n, d]) => {
  const info = PARTY[n];
  const stages = [
    convert(n, d, d.resists, { party: { owner: info.owner, stage: 'initial' } }),
    convert(info.forms[0], d, d.sesists, { party: { owner: info.owner, stage: 'evolved' } }),
    convert(info.forms[1], d, d.sfsists, { party: { owner: info.owner, stage: 'ultimate' } }),
  ];
  stages[0].party.evolvedId = stages[1].id;
  stages[1].party.baseId = stages[0].id;
  stages[1].party.evolvedId = stages[2].id;
  stages[2].party.baseId = stages[1].id;
  return stages;
});
const personas = [...Object.entries(demons).map(([n, d]) => convert(n, d, d.resists)), ...partyList].sort((a, b) =>
  a.name.localeCompare(b.name),
);

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
// Tipos de herencia: qué elementos puede heredar (ratio > 0). Las pasivas siempre.
const ELEM = { phy: 'phy', fir: 'fir', ice: 'ice', ele: 'ele', win: 'win', lig: 'lig', dar: 'dar', alm: 'alm', ail: 'ail', rec: 'rec', sup: 'sup', spe: 'sup' };
const inheritTypes = Object.fromEntries(
  inherit.inherits.map((type, i) => [
    type,
    [...new Set([...inherit.elems.filter((_, j) => inherit.ratios[i][j] > 0).map((e) => ELEM[e]), 'pas'])],
  ]),
);

/* ---------- Arcanas ---------- */
const arcanaNames = {};
for (const a of game.arcana) {
  const id = a.en.toLowerCase().replace(' man', '');
  if (arcanaOrder.includes(id) || id === 'world') arcanaNames[id] = { en: a.en, es: a.es };
}

const write = (file, data) => writeFileSync(join(outDir, file), JSON.stringify(data, null, 1) + '\n');
write('personas.json', personas);
write('skills.json', skills);
write('fusion.json', { arcanaOrder, arcanaNames, chart: table, specialRecipes: special, inheritTypes });
write('meta.json', {
  source: 'https://github.com/aqiu384/megaten-fusion-tool',
  license: 'Unlicense (dominio público)',
  officialNames: 'Persona 4 Golden (texto del juego en español e inglés)',
  sourceCommit: process.argv[3] ?? null,
  importedAt: new Date().toISOString().slice(0, 10),
  counts: {
    personas: personas.filter((p) => !p.party).length,
    party: personas.filter((p) => p.party).length,
    special: personas.filter((p) => p.flags.special).length,
    skills: Object.keys(skills).length,
  },
  warnings,
});
console.log(`Personas: ${personas.length} · Skills: ${Object.keys(skills).length} · Avisos: ${warnings.length}`);
warnings.slice(0, 40).forEach((w) => console.log(' -', w));
