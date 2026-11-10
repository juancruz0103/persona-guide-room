#!/usr/bin/env node
/**
 * Conversaciones de confidentes: texto OFICIAL del juego + puntos de las guías.
 *
 *   Puntos «?»: respuesta recomendada por la guía sin puntos conocidos.
 *   «R | REQUISITO | texto», «R | SINRECOMPENSA», «R | MEMENTOS | título | descripción | [archivo después del que va]».
 *   «R | NOIMPORTA»: en ese rango las respuestas no suman puntos.
 *   Líneas «CONSEJO | texto» de la guía van a los consejos de la ficha.
 *   node scripts/import-confidants/import.mjs <convs.json> <id> [<id>...]
 *
 * - <convs.json>: conversaciones extraídas de EVENT_DATA/MESSAGE/E700 (español e
 *   inglés) por scripts/import-confidants/extract.py.
 * - guias/<id>.txt: puntos de la guía, una línea por opción:
 *       RANGO | opción en inglés | puntos
 *       RANGO | TEL | frase EN | frase ES | opción EN | opción ES | puntos   (llamadas de Royal)
 *       RANGO | DESBLOQUEO | nombre | descripción
 *   Las opciones que la guía no lista dan 0 puntos.
 *
 * Las elecciones del evento sin ninguna opción en la guía (por ejemplo "¿seguimos?")
 * no dan puntos y no se muestran. Las llamadas telefónicas de Royal no están en
 * los eventos: van con el texto en inglés de la guía y traducción provisoria.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const [convsPath, ...ids] = process.argv.slice(2);
const here = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(here, '../../src/games/p5r/data/confidants');
/**
 * Rango 9 con romance: elecciones que solo aparecen en una de las dos rutas
 * (revisado a mano en los BMD: lo que sigue a «I'm now in a relationship…» es romance;
 * lo que sigue a la respuesta de amistad, amistad).
 */
const ROUTES = {
  'E709_090|SEL_023_1_0': 'romance', 'E709_090|SEL_023_3_0': 'romance', 'E709_090|SEL_036_0_0': 'romance', // Futaba
  'E706_090|SEL_039_0_0': 'romance', // Ann
  'E702_092|SEL_016_5_0': 'romance', // Makoto: «That's not what I meant.» vuelve a la amistad
  'E722_092|SEL_037_0_0': 'friend', 'E722_092|SEL_046_0_0': 'romance', 'E722_092|SEL_055_0_0': 'romance', // Kasumi
  'E713_090|SEL_024_5_0': 'romance', 'E713_090|SEL_026_0_0': 'romance', // Takemi
  'E715_090|SEL_044_0_0': 'romance', 'E715_090|SEL_052_0_0': 'friend', // Ohya (SEL_052 repite la pregunta sin romance)
  'E717_091|SEL_021_5_0': 'romance', // Hifumi: «We'll be friends forever.» vuelve a la amistad
};

const convs = JSON.parse(readFileSync(convsPath, 'utf8'));
const index = JSON.parse(readFileSync(join(dataDir, 'index.json'), 'utf8'));

const norm = (s) => s.toLowerCase().replace(/[“”"'’‘.,!?…\-—]/g, '').replace(/\s+/g, ' ').trim();

for (const id of ids) {
  const guide = readFileSync(join(here, 'guias', `${id}.txt`), 'utf8').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
  const meta = index.find((c) => c.id === id);
  const points = new Map(); // rango → Map(opción normalizada → puntos)
  const phones = new Map(); // rango → [{prompt, options:[{en, points}]}]
  const unlocks = new Map();
  const romanceOpts = new Set();
  const tips = [];
  const dontMatter = new Set([10]); // en el rango máximo las respuestas ya no suman
  const requirements = new Map(); // rango → [texto]
  const missions = new Map(); // rango → [{title, description, after}]
  const noReward = new Set();
  for (const line of guide) {
    const f = line.split('|').map((x) => x.trim());
    if (f[1] === 'REQUISITO') { requirements.set(Number(f[0]), [...(requirements.get(Number(f[0])) ?? []), f[2]]); continue; }
    if (f[1] === 'MEMENTOS') {
      missions.set(Number(f[0]), [...(missions.get(Number(f[0])) ?? []), { title: f[2], description: f[3], after: f[4] || null }]);
      continue;
    }
    if (f[1] === 'SINRECOMPENSA') { noReward.add(Number(f[0])); continue; }
    if (/^\d+ \| NOIMPORTA$/.test(line)) { dontMatter.add(Number(line.split('|')[0])); continue; }
    if (line.startsWith('CONSEJO |')) { tips.push(line.slice(9).trim()); continue; }
    const p = line.split('|').map((s) => s.trim());
    const rank = Number(p[0]);
    if (p[1] === 'DESBLOQUEO') { unlocks.set(rank, [...(unlocks.get(rank) ?? []), { name: p[2], description: p[3] }]); continue; }
    if (p[1] === 'TEL') {
      const list = phones.get(rank) ?? [];
      let call = list.find((c) => c.prompt === p[2]);
      if (!call) { call = { prompt: p[2], promptEs: p[3], options: [] }; list.push(call); }
      call.options.push({ en: p[4], es: p[5], points: Number(p[6] ?? 0), ...(p[7] === 'ROMANCE' ? { romance: true } : {}) });
      phones.set(rank, list);
      continue;
    }
    const m = points.get(rank) ?? new Map();
    m.set(norm(p[1]), p[2] === '?' ? '?' : Number(p[2])); // «?»: recomendada por la guía, sin puntos conocidos
    if (p[3] === 'ROMANCE') romanceOpts.add(`${rank}|${norm(p[1])}`);
    points.set(rank, m);
  }

  const used = new Set();
  const ranks = [];
  const report = [];
  for (let r = 1; r <= 10; r++) {
    const pts = points.get(r) ?? new Map();
    const conversations = [];
    for (const c of convs[id]?.[String(r)] ?? []) {
      const matched = c.options.filter((o) => pts.has(norm(o.en)));
      if (!matched.length) continue;
      for (const o of matched) used.add(`${r}|${norm(o.en)}`);
      const route = ROUTES[`${c.file}|${c.key}`];
      // En la ruta de amistad ninguna respuesta inicia el romance (aunque el texto se repita)
      const isRomance = (o) => route !== 'friend' && romanceOpts.has(`${r}|${norm(o.en)}`);
      conversations.push({
        file: c.file,
        kind: 'conversation',
        royalOnly: false,
        romance: c.options.some(isRomance),
        ...(route ? { route } : {}),
        speaker: meta.name.split(' ')[0],
        prompt: c.prompt,
        options: c.options.map((o) => ({
          es: o.es,
          en: o.en,
          points: typeof pts.get(norm(o.en)) === 'number' ? pts.get(norm(o.en)) : 0,
          ...(pts.get(norm(o.en)) === '?' ? { recommended: true } : {}),
          ...(isRomance(o) ? { romance: true } : {}),
        })),
      });
    }
    for (const call of phones.get(r) ?? []) {
      conversations.push({
        kind: 'phone',
        royalOnly: true,
        romance: call.options.some((o) => o.romance),
        provisional: true,
        speaker: meta.name.split(' ')[0],
        prompt: { es: call.promptEs ?? call.prompt, en: call.prompt },
        options: call.options,
      });
    }
    for (const [k] of pts) if (!used.has(`${r}|${k}`)) report.push(`rango ${r}: la opción de la guía «${k}» no aparece en el juego`);
    const hasChoices = conversations.length > 0;
    // Misiones de Mementos: después de la última conversación del archivo indicado (o al final de las del rango)
    for (const m of missions.get(r) ?? []) {
      let at = conversations.filter((c) => c.kind === 'conversation').length;
      if (m.after) {
        const last = conversations.map((c) => c.file).lastIndexOf(m.after);
        if (last === -1) report.push(`rango ${r}: la misión «${m.title}» apunta a ${m.after}, que no tiene conversaciones`);
        else at = last + 1;
      }
      conversations.splice(at, 0, { kind: 'mementos', title: m.title, description: m.description });
    }
    for (const c of conversations) delete c.file;
    const rank = { rank: r, conversations, unlocks: unlocks.get(r) ?? [] };
    if (requirements.has(r)) rank.requirements = requirements.get(r);
    if (noReward.has(r)) {
      if (rank.unlocks.length) report.push(`rango ${r}: marcado sin recompensa pero tiene desbloqueos`);
      rank.noReward = true;
    } else if (!rank.unlocks.length) report.push(`rango ${r}: sin recompensa cargada`);
    if (!hasChoices) {
      // Sin elecciones en el juego, o la guía dice que no importan → «elige la que quieras».
      // Si el juego tiene elecciones pero la guía no da puntos → «sin datos» (no inventamos).
      const gameHasChoices = (convs[id]?.[String(r)] ?? []).length > 0;
      if (dontMatter.has(r) || !gameHasChoices) rank.choicesDontMatter = true;
      else rank.noData = true;
    }
    ranks.push(rank);
  }

  const out = {
    id,
    name: meta.name,
    arcana: meta.arcana,
    phantomThief: meta.phantomThief,
    romance: meta.romance,
    maxRank: 10,
    tips: [],
    textsProvisional: false,
    sources: [readFileSync(join(here, 'guias', `${id}.txt`), 'utf8').match(/^# fuente: (\S+)/m)?.[1] ?? ''],
    ranks,
  };
  const prev = existsSync(join(dataDir, `${id}.json`)) ? JSON.parse(readFileSync(join(dataDir, `${id}.json`), 'utf8')) : null;
  out.tips = tips.length ? tips : prev?.tips ?? [];
  writeFileSync(join(dataDir, `${id}.json`), JSON.stringify(out, null, 1) + '\n');
  const n = ranks.reduce((a, r) => a + r.conversations.length, 0);
  console.log(`${id}: ${n} conversaciones`);
  for (const r of report) console.log('  ⚠ ' + r);
}
