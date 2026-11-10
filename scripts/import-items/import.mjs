#!/usr/bin/env node
/**
 * Arma la base de items de la silla eléctrica (src/games/p5r/data/generated/items.json).
 *
 * Fuentes:
 *  - Personas y su item normal / con Alarma de fusión: aqiu384 (ya importado).
 *  - Accesorios → skill que enseñan: aqiu384, roy-accessories.json (ya importado).
 *  - Tipo, personaje y estadísticas de armas y armaduras: quan/persona5-items
 *    (licencia MIT, datos de Persona 5 original).
 *
 * Uso:
 *   git clone --depth 1 https://github.com/quan/persona5-items /tmp/p5items
 *   node scripts/import-items/import.mjs /tmp/p5items/src/data/itemizations.data.json
 *
 * Lo que no se puede clasificar o traducir con seguridad queda en
 * docs/REVISAR-items.md para comprobarlo en el juego.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const quanPath = process.argv[2];
if (!quanPath) {
  console.error('Falta la ruta a itemizations.data.json de quan/persona5-items');
  process.exit(1);
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const gen = join(root, 'src/games/p5r/data/generated');
const personas = JSON.parse(readFileSync(join(gen, 'personas.json'), 'utf8'));
const skills = JSON.parse(readFileSync(join(gen, 'skills.json'), 'utf8'));
const accessories = JSON.parse(readFileSync(join(gen, 'accessories.json'), 'utf8'));
const quan = JSON.parse(readFileSync(quanPath, 'utf8'));

const quanByName = new Map(quan.map((x) => [x.itemization, x]));
const review = [];

/* ---------- Traducción de efectos (redacción propia) ---------- */

const LEVEL = { low: 'baja', med: 'media', high: 'alta' };
const ELEM = {
  Physical: 'Físico', Fire: 'Fuego', Ice: 'Hielo', Elec: 'Eléctrico', Wind: 'Viento',
  Psy: 'Psi', Nuke: 'Nuclear', Bless: 'Bendición', Curse: 'Maldición', Magic: 'magia',
};
const AIL = {
  Burn: 'Quemadura', Freeze: 'Congelación', Shock: 'Electrocución', Dizzy: 'Mareo', Sleep: 'Sueño',
  Confuse: 'Confusión', Fear: 'Miedo', Despair: 'Desesperación', Rage: 'Furia', Brainwash: 'Lavado de cerebro',
  'Random Ailment': 'estado alterado al azar',
};
const STAT = { St: 'Fuerza', Str: 'Fuerza', Ma: 'Magia', En: 'Resistencia', Ag: 'Agilidad', Lu: 'Suerte' };

const RULES = [
  [/^Attack (\d+)$/, (m) => ({ stat: 'attack', value: +m[1] })],
  [/^Accuracy (\d+)$/, (m) => ({ stat: 'accuracy', value: +m[1] })],
  [/^Defense (\d+)$/, (m) => ({ stat: 'defense', value: +m[1] })],
  [/^Evasion (\d+)$/, (m) => ({ stat: 'evasion', value: +m[1] })],
  [/^Rounds (\d+)$/, (m) => ({ stat: 'rounds', value: +m[1] })],
  [/^\+?(\w+) ?\+ ?(\d+)$/, (m) => STAT[m[1]] && `${STAT[m[1]]} +${m[2]}`],
  [/^All stats ?\+ ?(\d+)$/, (m) => `Todas las estadísticas +${m[1]}`],
  [/^\+(\d+) (HP|SP)$/, (m) => `+${m[1]} ${m[2]} máximo`],
  [/^Regenerate (\d+)$/, (m) => `Regenera ${m[1]} HP por turno`],
  [/^\+?Auto-(\w+)$/, (m) => `${m[1]} automático al empezar el combate`],
  [/^\+Critical [Rr]ate up \((\w+)\)$/, (m) => `Más probabilidad de crítico (${LEVEL[m[1]]})`],
  [/^\+Reduce (\w+) dmg \((\w+)\)$/, (m) => ELEM[m[1]] && `Reduce el daño de ${ELEM[m[1]]} (${LEVEL[m[2]]})`],
  [/^\+?Evade (\w+) \((\w+)\)$/i, (m) => ELEM[cap(m[1])] && `Más evasión contra ${ELEM[cap(m[1])]} (${LEVEL[m[2]]})`],
  [/^\+Repel (\w+) \((\w+)\)$/, (m) => ELEM[m[1]] && `Puede reflejar ataques de ${ELEM[m[1]]} (${LEVEL[m[2]]})`],
  [/^\+Null (\w+)$/, (m) => AIL[m[1]] && `Inmune a ${AIL[m[1]]}`],
  [/^\+(\w+) attacks$/, (m) => ELEM[m[1]] && `Los ataques hacen daño de ${ELEM[m[1]]}`],
  [/^Prevents insta-kill from (\w+)$/, (m) => ELEM[m[1]] && `Evita la muerte instantánea de ${ELEM[m[1]]}`],
  [/^\+([\w ]+) \((\w+)\)$/, (m) => AIL[m[1]] && `Puede causar ${AIL[m[1]]} (${LEVEL[m[2]]})`],
];
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function parseDescription(desc, itemName) {
  const stats = {};
  const effects = [];
  for (const part of desc.split(/\s*\/\s*/).map((p) => p.trim()).filter(Boolean)) {
    let done = false;
    for (const [re, fn] of RULES) {
      const m = part.match(re);
      if (!m) continue;
      const r = fn(m);
      if (!r) continue;
      if (typeof r === 'string') effects.push(r);
      else stats[r.stat] = r.value;
      done = true;
      break;
    }
    if (!done) {
      effects.push(part);
      review.push({ item: itemName, why: `Efecto sin traducir: "${part}"` });
    }
  }
  return { stats, effects };
}

/* ---------- Clasificación ---------- */

const OWNER = { MC: 'joker', Ryuji: 'skull', Morgana: 'mona', Ann: 'panther', Yusuke: 'fox', Makoto: 'queen', Haru: 'noir' };
const GENDER = { Male: 'male', Female: 'female', Unisex: 'unisex', Morgana: 'morgana' };

function fromQuan(entry, variant) {
  const [kind, who] = entry.category.split(' - ').map((s) => s.trim());
  const base = { source: 'quan', p5Stats: true, variantOf: variant ?? null };
  if (kind === 'Weapon' || kind === 'Gun') {
    if (!OWNER[who]) review.push({ item: entry.itemization, why: `Personaje desconocido: ${who}` });
    return { ...base, type: kind === 'Weapon' ? 'melee' : 'gun', owner: OWNER[who] ?? null };
  }
  if (kind === 'Protector') return { ...base, type: 'armor', gender: GENDER[who] ?? null };
  if (kind === 'Accessory') return { ...base, type: 'accessory' };
  return null;
}

const items = {};
const names = new Set(personas.flatMap((p) => [p.itemization, p.itemizationAlt]).filter(Boolean));

for (const name of [...names].sort()) {
  // 1. Skill card: el item se llama igual que una skill
  if (skills[name]) {
    items[name] = { name, type: 'skillcard', skill: name, source: 'aqiu384' };
    continue;
  }
  // 2. Accesorio que enseña una skill
  if (accessories[name]) {
    const skill = accessories[name];
    items[name] = { name, type: 'accessory', skill, source: 'aqiu384' };
    continue;
  }
  // 3. Arma / armadura con datos de P5
  let q = quanByName.get(name);
  let variant = null;
  if (!q) {
    const baseName = name.replace(/ (R|EX|II)$/, '');
    if (baseName !== name && quanByName.has(baseName)) {
      q = quanByName.get(baseName);
      variant = baseName;
    }
  }
  if (q) {
    const cls = fromQuan(q, variant);
    if (cls) {
      // Una variante de Royal (R, EX, II) es más fuerte que la base: solo se toma el tipo, no los números.
      const parsed = variant ? { stats: {}, effects: [] } : parseDescription(q.description, name);
      items[name] = { name, ...cls, ...parsed };
      if (variant) review.push({ item: name, why: `Versión de Royal de "${variant}": tipo conocido, faltan estadísticas` });
      continue;
    }
  }
  // 4. Sin datos
  items[name] = { name, type: 'unknown', source: null };
  review.push({ item: name, why: 'Item agregado en Royal: falta saber tipo y estadísticas' });
}

writeFileSync(join(gen, 'items.json'), JSON.stringify(items, null, 1) + '\n');

const counts = Object.values(items).reduce((acc, it) => ((acc[it.type] = (acc[it.type] ?? 0) + 1), acc), {});
console.log(`Items: ${Object.keys(items).length}`, counts);

// Qué Persona hay que ejecutar en la silla eléctrica para conseguir cada item (nombres oficiales en español)
const gameText = JSON.parse(readFileSync(join(gen, 'game-text.json'), 'utf8'));
const esPersona = (n) => gameText.personas[n]?.es ?? n;
const esItem = (n) => gameText.items[n]?.es ?? n;
const personaList = Array.isArray(personas) ? personas : Object.values(personas);
const sourcesOf = (item) => [
  ...personaList.filter((p) => p.itemization === item).map((p) => `${esPersona(p.name)} (Nv ${p.level})`),
  ...personaList.filter((p) => p.itemizationAlt === item).map((p) => `${esPersona(p.name)} (Nv ${p.level}) con Alarma de fusión`),
];

const md = [
  '# Items a revisar en el juego',
  '',
  'Generado por `scripts/import-items/import.mjs`. Cada línea es un item de la silla eléctrica',
  'al que le falta información. Cuando lo compruebes, anotá tipo y estadísticas.',
  '',
  '| Item | En el juego (español) | Persona para la silla eléctrica | Qué falta |',
  '|------|------|------|-----------|',
  ...review.map((r) => `| ${r.item} | ${esItem(r.item)} | ${sourcesOf(r.item).join('; ') || '—'} | ${r.why} |`),
  '',
].join('\n');
writeFileSync(join(root, 'docs/REVISAR-items.md'), md);
console.log(`A revisar: ${review.length} (docs/REVISAR-items.md)`);
