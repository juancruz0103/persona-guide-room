#!/usr/bin/env node
/**
 * Nombres y descripciones OFICIALES de P5R (español e inglés), leídos de los
 * archivos de texto del juego que el usuario extrae de su propia copia.
 *
 * Genera src/games/p5r/data/generated/game-text.json:
 *   { skills: { [nombre interno]: { es, en, descEs, descEn } },
 *     personas: { [nombre interno]: { es, en } },
 *     items: { [nombre interno]: { es, en, descEs, descEn } } }
 * El "nombre interno" es el que usa el resto de los datos (aqiu384, en inglés).
 *
 * Uso (rutas a las carpetas extraídas de ES.CPK y EN.CPK con CriFsLib):
 *   node scripts/import-game-text/import.mjs <carpeta ES> <carpeta EN> <megaten-fusion-tool>/src/app/p5/data
 *
 * Archivos que se leen de cada carpeta:
 *   BATTLE/TABLE.PAC  → NAME.TBL (todos los nombres del juego)
 *   INIT/DATMSG.PAK   → textos de ayuda (descripciones de skills e items)
 * Los archivos del juego NO se suben al repositorio: solo este resultado.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const [esDir, enDir, refDir] = process.argv.slice(2);
if (!esDir || !enDir || !refDir) {
  console.error('Uso: import.mjs <carpeta ES> <carpeta EN> <megaten-fusion-tool>/src/app/p5/data');
  process.exit(1);
}
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const gen = join(root, 'src/games/p5r/data/generated');

/* ---------- Codificación de texto de Atlus ---------- */
// ASCII va tal cual. Los demás caracteres usan 2 bytes: índice de la fuente del
// juego = (b1 - 0x80) * 128 + (b2 - 0x80). Desde el índice 0x1F6 (À) siguen el
// orden de Latin-1, salteando × y ÷. Los signos de antes de À van por tabla.
const SPECIAL = { 0x1db: '¡', 0x1e3: 'ª', 0x1e4: '«', 0x1f1: '»', 0x1f5: '¿' };
function decode(buf) {
  let out = '';
  for (let i = 0; i < buf.length; ) {
    const c = buf[i];
    if (c < 0x80) { out += String.fromCharCode(c); i++; continue; }
    const lo = buf[i + 1];
    i += 2;
    const idx = (c - 0x80) * 128 + (lo - 0x80);
    if (c === 0x80 && lo >= 0xa0) { out += String.fromCharCode(lo - 0x60); continue; } // ASCII "ancho"
    if (SPECIAL[idx]) { out += SPECIAL[idx]; continue; }
    if (idx >= 0x1f6 && idx <= 0x233) {
      let cp = 0xc0 + (idx - 0x1f6);
      if (cp >= 0xd7) cp++; // ×
      if (cp >= 0xf7) cp++; // ÷
      out += String.fromCharCode(cp);
      continue;
    }
    out += '\ufffd';
  }
  return out;
}

/* ---------- Contenedores ---------- */
const align = (n, a) => Math.ceil(n / a) * a;

/** PAC v1: nombre de 252 bytes + tamaño, datos alineados a 64. */
function readPac(path) {
  const d = readFileSync(path);
  const files = {};
  for (let off = 0; off + 256 <= d.length; ) {
    const name = d.subarray(off, off + 252).toString('latin1').split('\0')[0];
    if (!name) break;
    let size = d.readUInt32LE(off + 252);
    if (size > d.length) size = d.readUInt32BE(off + 252);
    files[name] = d.subarray(off + 256, off + 256 + size);
    off += 256 + align(size, 64);
  }
  return files;
}

/** PAK v2: cantidad + (nombre de 32 bytes, tamaño, datos). Big-endian. */
function readPak(path) {
  const d = readFileSync(path);
  const files = {};
  let off = 4;
  for (let n = d.readUInt32BE(0); n > 0; n--) {
    const name = d.subarray(off, off + 32).toString('latin1').split('\0')[0];
    const size = d.readUInt32BE(off + 32);
    files[name] = d.subarray(off + 36, off + 36 + size);
    off += 36 + size;
  }
  return files;
}

/** NAME.TBL: secciones de (tabla de offsets u16, bloque de textos), alineadas a 16. */
function readNameTbl(d) {
  const segs = [];
  for (let off = 0; off < d.length; ) {
    const n = d.readUInt32BE(off);
    const offs = [];
    for (let i = 0; i < n / 2; i++) offs.push(d.readUInt16BE(off + 4 + i * 2));
    off = align(off + 4 + n, 16);
    const m = d.readUInt32BE(off);
    const blob = d.subarray(off + 4, off + 4 + m);
    off = align(off + 4 + m, 16);
    segs.push(offs.map((o) => decode(blob.subarray(o, blob.indexOf(0, o)))));
  }
  return segs;
}

/** BMD (MSG1, big-endian): devuelve el texto de cada mensaje, en orden. */
function readBmd(d) {
  const count = d.readUInt32BE(0x18);
  const out = [];
  for (let k = 0; k < count; k++) {
    const type = d.readUInt32BE(0x20 + k * 8);
    const p = d.readUInt32BE(0x24 + k * 8) + 0x20;
    if (type !== 0) { out.push(''); continue; }
    const pages = d.readUInt16BE(p + 24);
    const offs = [];
    for (let j = 0; j < pages; j++) offs.push(d.readUInt32BE(p + 28 + j * 4) + 0x20);
    const size = d.readUInt32BE(p + 28 + pages * 4);
    const end = p + 32 + pages * 4 + size;
    const texts = offs.map((a, j) => pageText(d.subarray(a, j + 1 < pages ? offs[j + 1] : end)));
    out.push(texts.join(' '));
  }
  return out;
}

/** Saca los códigos de control (0xFn ...) y une las líneas. */
function pageText(b) {
  const bytes = [];
  for (let i = 0; i < b.length; ) {
    const c = b[i];
    if (c === 0) break;
    if ((c & 0xf0) === 0xf0) { i += 2 + Math.max((c & 0x0f) * 2 - 2, 0); continue; }
    if (c >= 0x80) { bytes.push(c, b[i + 1]); i += 2; continue; }
    bytes.push(c); i++;
  }
  return decode(Buffer.from(bytes)).replace(/\s*\n\s*/g, ' ').replace(/\s+/g, ' ').trim();
}

function load(dir) {
  const names = readNameTbl(readPac(join(dir, 'BATTLE/TABLE.PAC'))['NAME.TBL']);
  const help = readPak(join(dir, 'INIT/DATMSG.PAK'));
  const bmd = (f) => readBmd(help[f]);
  return {
    names,
    help: {
      skill: bmd('datSkillHelp.bmd'),
      accessory: bmd('datAccessoryHelp.bmd'),
      armor: bmd('datArmorHelp.bmd'),
      melee: bmd('datWeaponHelp.bmd'),
      gun: bmd('datGunHelp.bmd'),
      skillcard: bmd('datSkillCardHelp.bmd'),
      myth: bmd('datMyth.bmd'),
    },
  };
}

const ES = load(esDir);
const EN = load(enDir);

// Secciones de NAME.TBL (mismo orden en todos los idiomas)
const SEG = { skills: 1, enemies: 3, personas: 4, traits: 5, accessories: 6, armor: 7, melee: 11, skillcards: 14, guns: 18 };
const JUNK = new Set(['RESERVE', 'RESERVAR', 'Unused', 'Sin usar', 'BLANK', 'Blank', 'En blanco', 'Not Used', '']);
const bad = (s) => !s || JUNK.has(s) || s.includes('�') || /^EN BLANCO|^BLANK/i.test(s);
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’]/g, "'").toLowerCase().trim();
const review = [];

/* ---------- Skills: emparejadas por ID interno (aqiu384) ---------- */
const refSkills = {
  ...JSON.parse(readFileSync(join(refDir, 'skill-data.json'), 'utf8')),
  ...JSON.parse(readFileSync(join(refDir, 'roy-skill-data.json'), 'utf8')),
};
const ourSkills = JSON.parse(readFileSync(join(gen, 'skills.json'), 'utf8'));
const skills = {};
for (const [id, v] of Object.entries(refSkills)) {
  const name = v.a[0];
  if (!ourSkills[name]) continue;
  const i = Number(id);
  let seg, idx, desc;
  if (i < ES.names[SEG.skills].length) { seg = SEG.skills; idx = i; desc = true; }
  else if (i >= 1200) { seg = SEG.traits; idx = i - 1200; desc = false; }
  else continue;
  const es = ES.names[seg][idx];
  const en = EN.names[seg][idx];
  if (bad(es) || bad(en)) { review.push(`Skill sin nombre oficial: ${name}`); continue; }
  skills[name] = {
    es, en,
    ...(desc && !bad(ES.help.skill[idx]) ? { descEs: ES.help.skill[idx], descEn: EN.help.skill[idx] } : {}),
  };
}

/* ---------- Habilidades de navegación que no están en las tablas: nombre anotado en partida ---------- */
const MANUAL_SKILLS = {
  'Mementos Scan': { es: 'Análisis de Mementos', en: 'Mementos Scan', descEs: 'Al entrar en un piso de Mementos, puede revelar el mapa completo.' },
  'Treasure Reboot': { es: 'Tesoro doble', en: 'Treasure Reboot', descEs: 'Puede hacer reaparecer las Sombras con tesoro.' },
};
for (const [k, v] of Object.entries(MANUAL_SKILLS)) if (!skills[k]) skills[k] = v;
for (const n of Object.keys(ourSkills)) if (!skills[n]) review.push(`Skill sin nombre oficial: ${n}`);

/* ---------- Rasgos (traits) que no están en skills.json: por nombre en inglés ---------- */
const traitIdx = new Map();
EN.names[SEG.traits].forEach((n, i) => { if (!bad(n)) traitIdx.set(norm(n), i); });
for (const p of [
  ...JSON.parse(readFileSync(join(gen, 'personas.json'), 'utf8')),
  ...JSON.parse(readFileSync(join(gen, 'party.json'), 'utf8')),
]) {
  const t = p.trait;
  if (!t || skills[t]) continue;
  const i = traitIdx.get(norm(t));
  if (i === undefined || bad(ES.names[SEG.traits][i])) { review.push(`Rasgo sin nombre oficial: ${t}`); continue; }
  skills[t] = { es: ES.names[SEG.traits][i], en: EN.names[SEG.traits][i] };
}

/* ---------- Personas: emparejadas por nombre en inglés ---------- */
// Diferencias de escritura entre aqiu384 y el juego. El índice indica cuál
// de los nombres repetidos es (Orpheus aparece dos veces: P3 hombre y mujer).
const PERSONA_ALIAS = {
  Koropokkuru: 'Koropokguru',
  // El juego llama igual a las dos: se agrega la F para distinguirlas
  'Orpheus F': { name: 'Orpheus', nth: 1, female: true },
  'Orpheus F Picaro': { name: 'Orpheus Picaro', nth: 1, female: true },
  'Izanagi-no-Okami Picaro': 'Izanagi-no-Okami Pic.',
  'Magatsu-Izanagi Picaro': 'M. Izanagi Picaro',
};
const ourPersonas = [
  ...JSON.parse(readFileSync(join(gen, 'personas.json'), 'utf8')),
  // Personas de los compañeros (no se fusionan, pero tienen ficha)
  ...JSON.parse(readFileSync(join(gen, 'party.json'), 'utf8')),
];
const pIdx = new Map();
EN.names[SEG.personas].forEach((n, i) => {
  if (bad(n)) return;
  const k = norm(n);
  pIdx.set(k, [...(pIdx.get(k) ?? []), i]);
});
/** Nombre completo: la tabla de Personas a veces abrevia ("Amuleto del emperad."). */
function fullName(langNames, i) {
  const short = langNames[SEG.personas][i];
  if (!short.endsWith('.')) return short;
  const stem = short.slice(0, -1);
  const full = langNames[SEG.enemies].find((n) => n.startsWith(stem) && n.length > stem.length);
  return full ?? short;
}
const expand = (s) => s.replace(/ Píc\.$/, ' Pícaro').replace(/ Pic\.$/, ' Picaro').replace(/^M\. Izanagi/, 'Magatsu-Izanagi');
const personas = {};
for (const p of ourPersonas) {
  const alias = PERSONA_ALIAS[p.name];
  const target = typeof alias === 'string' ? alias : alias?.name ?? p.name;
  const nth = typeof alias === 'object' ? alias.nth : 0;
  const i = pIdx.get(norm(target))?.[nth];
  if (i === undefined) { review.push(`Persona sin nombre oficial: ${p.name}`); continue; }
  let es = expand(fullName(ES.names, i));
  let en = expand(fullName(EN.names, i));
  if (alias?.female) {
    es = es.replace(/^(\S+)/, '$1 F');
    en = en.replace(/^(\S+)/, '$1 F');
  }
  // Origen: texto de mitología del compendio (mismo índice que el nombre)
  const mythEs = ES.help.myth[i];
  const mythEn = EN.help.myth[i];
  personas[p.name] = { es, en, ...(!bad(mythEs) ? { mythEs, mythEn } : {}) };
}

/* ---------- Items: emparejados por nombre en inglés ---------- */
const ITEM_ALIAS = {
  'Megaton Raid Belt': 'Megaton Belt',
  'Assault Dive Belt': 'Assault Belt',
  'Brave Blade Belt': 'Brave Belt',
  'Gattling Blows Belt': 'Gatling Belt',
  'Kill Rush Belt': 'Rush Belt', // va en el orden de las skills: Lunge, Assault, Megaton, God's Hand, Lucky, Miracle, Rush (Kill Rush), Gatling...
  'Myriad Slashes Belt': 'Myriad Slash Belt',
  'Great Thief Stick': 'The Great Thief Stick',
  'Judgement Cross': 'Judgment Cross',
  'Kuzuryu Gouhou': 'K. Gouhou',
  'Kuzuryu Gouhou EX': 'K. Gouhou EX',
  "Emperor's Amulet": "Emperor's Charm",
  "Emperor's Amulet R": "Emperor's Charm R",
};
const ITEM_SEGS = [
  [SEG.accessories, 'accessory'],
  [SEG.armor, 'armor'],
  [SEG.melee, 'melee'],
  [SEG.guns, 'gun'],
];
const iIdx = new Map();
for (const [seg, kind] of ITEM_SEGS) {
  EN.names[seg].forEach((n, i) => {
    if (!bad(n) && !iIdx.has(norm(n))) iIdx.set(norm(n), { seg, kind, i });
  });
}
const ourItems = JSON.parse(readFileSync(join(gen, 'items.json'), 'utf8'));
const items = {};
for (const [name, it] of Object.entries(ourItems)) {
  if (it.type === 'skillcard') {
    // La skill card se llama como la skill
    const s = skills[it.skill];
    if (s) items[name] = { es: s.es, en: s.en };
    else review.push(`Skill card sin nombre oficial: ${name}`);
    continue;
  }
  const hit = iIdx.get(norm(ITEM_ALIAS[name] ?? name));
  if (!hit) { review.push(`Item sin nombre oficial: ${name}`); continue; }
  const descEs = ES.help[hit.kind][hit.i];
  const descEn = EN.help[hit.kind][hit.i];
  items[name] = {
    es: ES.names[hit.seg][hit.i],
    en: EN.names[hit.seg][hit.i],
    ...(!bad(descEs) ? { descEs, descEn } : {}),
  };
}

writeFileSync(join(gen, 'game-text.json'), JSON.stringify({ skills, personas, items }, null, 1) + '\n');
console.log(`Skills: ${Object.keys(skills).length}/${Object.keys(ourSkills).length}`);
console.log(`Personas: ${Object.keys(personas).length}/${ourPersonas.length}`);
console.log(`Items: ${Object.keys(items).length}/${Object.keys(ourItems).length}`);
console.log(review.length ? `Sin nombre oficial:\n  ${review.join('\n  ')}` : 'Todo con nombre oficial');
