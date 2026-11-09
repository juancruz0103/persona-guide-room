#!/usr/bin/env node
/**
 * Importa los datos de Persona 5 Royal desde aqiu384/megaten-fusion-tool
 * (licencia Unlicense, dominio público) y los convierte al formato propio
 * del proyecto (ver docs/ETAPA-1-informe.md, sección 3.3).
 *
 * Uso:
 *   git clone --depth 1 https://github.com/aqiu384/megaten-fusion-tool /tmp/aqiu
 *   node scripts/import-aqiu384/import.mjs /tmp/aqiu/src/app/p5/data $(git -C /tmp/aqiu rev-parse HEAD)
 *
 * Solo se leen los archivos "roy-*" (Royal). De skill-data.json (P5) se toman
 * las skills que Royal no redefine, igual que hace la herramienta original.
 *
 * Este script lee únicamente archivos JSON: no ejecuta código de la fuente.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const srcDir = process.argv[2];
if (!srcDir) {
  console.error('Falta la carpeta de datos. Ej: node import.mjs /tmp/aqiu/src/app/p5/data');
  process.exit(1);
}

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, '../../src/games/p5r/data/generated');
const read = (f) => JSON.parse(readFileSync(join(srcDir, f), 'utf8'));

const demons = read('roy-demon-data.json');
const baseSkills = read('skill-data.json');
const roySkills = read('roy-skill-data.json');
const fusionChart = read('roy-fusion-chart.json');
const elementChart = read('roy-element-chart.json');
const specialRecipes = read('roy-special-recipes.json');
const unlocks = read('roy-demon-unlocks.json');
const prereqs = read('roy-fusion-prereqs.json');

const warnings = [];

/* ---------- Mapeos ---------- */

const arcanaId = (race) => {
  if (/ P$/.test(race)) throw new Error(`Raza de grupo inesperada: ${race}`);
  return race.toLowerCase();
};

const RESIST_ELEMS = ['phy', 'gun', 'fir', 'ice', 'ele', 'win', 'psy', 'nuk', 'ble', 'cur'];
const RESIST_CODE = { w: 'weak', '-': 'neutral', s: 'resist', n: 'null', r: 'repel', d: 'drain' };

const INHERIT = {
  phys: 'phy', fire: 'fir', ice: 'ice', elec: 'ele', wind: 'win', psy: 'psy', nuke: 'nuk',
  bless: 'ble', curse: 'cur', ailment: 'ail', healing: 'rec', support: 'sup', almighty: 'alm', none: null,
};

const TARGET = {
  '1 foe': 'one', 'All foes': 'all', '1 ally': 'ally', 'All allies': 'party', Self: 'self', Universal: 'everyone',
};

const AILMENTS = {
  Burn: 'burn', Freeze: 'freeze', Shock: 'shock', Dizzy: 'dizzy', Sleep: 'sleep', Forget: 'forget',
  Confuse: 'confuse', Fear: 'fear', Despair: 'despair', Rage: 'rage', Brainwash: 'brainwash', Hunger: 'hunger',
};

const slug = (n) =>
  n.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Condiciones de desbloqueo escritas en español, conservando los nombres propios del juego. */
function translateStory(text) {
  const quoted = text.match(/^Cleared "(.+)"$/);
  if (quoted) return `Completar la petición de Mementos “${quoted[1]}”`;
  if (text === 'Unlocked Third Semester') return 'Llegar al Tercer Semestre';
  if (text === 'Cleared Good Ending, New Game+') return 'Haber visto el final bueno (Nueva Partida+)';
  warnings.push(`Condición de historia sin traducir: ${text}`);
  return text;
}

function translateTreasure(text) {
  const m = text.match(/^Recruit from (.+?)(?: or (Path of .+))?$/);
  if (!m) {
    warnings.push(`Condición de Treasure Demon sin traducir: ${text}`);
    return text;
  }
  return m[2] ? `Reclutar en ${m[1]} o en ${m[2]} (Mementos)` : `Reclutar en ${m[1]}`;
}

/* ---------- Desbloqueos ---------- */

const unlockOf = {};
const dlcNames = new Set();
for (const { category, conditions } of unlocks) {
  for (const [names, cond] of Object.entries(conditions)) {
    for (const name of names.split(',')) {
      if (category === 'Maxed Confidant') {
        const m = cond.match(/^(\w+) Rank (\d+)$/);
        unlockOf[name] = { type: 'confidant', arcana: arcanaId(m[1]), rank: Number(m[2]) };
      } else if (category === 'Downloadable Content') {
        dlcNames.add(name);
        unlockOf[name] = { type: 'dlc', pack: cond };
      } else if (category === 'Story Progression') {
        unlockOf[name] = { type: 'story', detail: translateStory(cond) };
      } else {
        warnings.push(`Categoría de desbloqueo desconocida: ${category}`);
      }
    }
  }
}
for (const [name, cond] of Object.entries(prereqs)) {
  unlockOf[name] = { type: 'treasure', detail: translateTreasure(cond) };
}

/* ---------- Skills ---------- */

const skillRows = {};
for (const row of Object.values(baseSkills)) skillRows[row.a[0]] = row;
for (const row of Object.values(roySkills)) skillRows[row.a[0]] = row; // Royal pisa a P5

function convertSkill(row) {
  const [name, elem, target] = row.a;
  const rawCost = row.b[1];
  let cost = null;
  if (rawCost >= 2000) cost = null; // costo especial: sin dato confiable
  else if (rawCost >= 1000) cost = { type: 'sp', value: rawCost - 1000 };
  else if (rawCost > 0) cost = { type: 'hp', value: rawCost };

  const isAttackOrAilment = !['pas', 'tra', 'sup', 'rec'].includes(elem);
  const ailment = isAttackOrAilment ? AILMENTS[row.c[0]] ?? null : null;

  return {
    name,
    element: elem,
    target: TARGET[target] ?? null,
    ailment,
    cost,
    power: row.b[2] || null,
    // rango > 89 = skill exclusiva: no existe como skill card ni se hereda
    unique: row.b[0] > 89 || row.b[0] === 0,
  };
}

/* ---------- Personas ---------- */

const usedSkills = new Set();
const personas = [];

for (const [name, d] of Object.entries(demons)) {
  const recipe = specialRecipes[name];
  const isTreasure = Array.isArray(recipe) && recipe.length === 0;
  const isSpecial = Array.isArray(recipe) && recipe.length > 0;

  const skills = Object.entries(d.skills)
    .map(([skill, lvl]) => ({ skill, raw: lvl }))
    .sort((a, b) => a.raw - b.raw)
    .map(({ skill, raw }) => {
      if (raw >= 100) warnings.push(`${name}: nivel de skill raro (${skill} = ${raw})`);
      usedSkills.add(skill);
      return { skill, level: raw < 1 ? null : raw };
    });

  if (d.resists.length !== 10) warnings.push(`${name}: resistencias con largo ${d.resists.length}`);

  personas.push({
    id: slug(name),
    name,
    arcana: arcanaId(d.race),
    level: d.lvl,
    flags: {
      dlc: dlcNames.has(name),
      treasure: isTreasure,
      special: isSpecial,
      picaro: / Picaro$/.test(name),
    },
    specialRecipe: isSpecial ? recipe : null,
    unlock: unlockOf[name] ?? null,
    resistances: Object.fromEntries(RESIST_ELEMS.map((e, i) => [e, RESIST_CODE[d.resists[i]] ?? 'neutral'])),
    stats: { st: d.stats[0], ma: d.stats[1], en: d.stats[2], ag: d.stats[3], lu: d.stats[4] },
    skills,
    inheritance: d.inherits in INHERIT ? INHERIT[d.inherits] : (warnings.push(`${name}: herencia ${d.inherits}`), null),
    trait: d.trait ?? null,
    // Silla eléctrica: item normal y con Alarma de fusión ("itemr" en la fuente)
    itemization: d.item ?? null,
    itemizationAlt: d.itemr ?? null,
    image: null,
  });
}

personas.sort((a, b) => a.name.localeCompare(b.name));

// Las skill cards de la silla eléctrica también cuentan como skills a mostrar.
for (const p of personas) {
  for (const it of [p.itemization, p.itemizationAlt]) if (it && skillRows[it]) usedSkills.add(it);
}

const skills = {};
for (const name of [...usedSkills].sort()) {
  const row = skillRows[name];
  if (!row) {
    warnings.push(`Skill sin datos: ${name}`);
    continue;
  }
  skills[name] = convertSkill(row);
}

/* ---------- Fusión ---------- */

// Tabla triangular → tabla completa { arcanaA: { arcanaB: resultado } }
const races = fusionChart.races.map(arcanaId);
const chart = {};
for (const r of races) chart[r] = {};
fusionChart.table.forEach((row, i) => {
  row.forEach((res, j) => {
    if (res === '-') return;
    chart[races[i]][races[j]] = arcanaId(res);
    chart[races[j]][races[i]] = arcanaId(res);
  });
});

// Treasure Demons: { tesoro: { arcana: escalones } }
const treasureChart = {};
const elemRaces = elementChart.races.map(arcanaId);
elementChart.elems.forEach((treasure, j) => {
  treasureChart[treasure] = {};
  elemRaces.forEach((race, i) => {
    const v = elementChart.table[i][j];
    if (v) treasureChart[treasure][race] = v;
  });
});

const specials = Object.fromEntries(Object.entries(specialRecipes).filter(([, ing]) => ing.length > 0));

/* ---------- Escritura ---------- */

mkdirSync(outDir, { recursive: true });
const write = (file, data) => writeFileSync(join(outDir, file), JSON.stringify(data, null, 1) + '\n');

write('personas.json', personas);
write('accessories.json', read('roy-accessories.json'));
write('skills.json', skills);
write('fusion.json', { arcanaOrder: races, chart, treasureChart, specialRecipes: specials });
write('meta.json', {
  source: 'https://github.com/aqiu384/megaten-fusion-tool',
  license: 'Unlicense (dominio público)',
  files: ['roy-demon-data.json', 'roy-skill-data.json', 'skill-data.json', 'roy-fusion-chart.json',
    'roy-element-chart.json', 'roy-special-recipes.json', 'roy-demon-unlocks.json', 'roy-fusion-prereqs.json',
    'roy-accessories.json'],
  sourceCommit: process.argv[3] ?? null,
  importedAt: new Date().toISOString().slice(0, 10),
  counts: {
    personas: personas.length,
    treasure: personas.filter((p) => p.flags.treasure).length,
    dlc: personas.filter((p) => p.flags.dlc).length,
    special: personas.filter((p) => p.flags.special).length,
    skills: Object.keys(skills).length,
  },
  warnings,
});

console.log(`Personas: ${personas.length} · Skills: ${Object.keys(skills).length}`);
if (warnings.length) console.log('Avisos:\n - ' + warnings.join('\n - '));
