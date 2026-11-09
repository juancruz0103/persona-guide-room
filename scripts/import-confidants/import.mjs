#!/usr/bin/env node
/**
 * Conversaciones de confidentes: texto OFICIAL del juego + puntos de las guías.
 *
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
  for (const line of guide) {
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
    m.set(norm(p[1]), Number(p[2]));
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
      conversations.push({
        kind: 'conversation',
        royalOnly: false,
        romance: c.options.some((o) => romanceOpts.has(`${r}|${norm(o.en)}`)),
        speaker: meta.name.split(' ')[0],
        prompt: c.prompt,
        options: c.options.map((o) => ({
          es: o.es,
          en: o.en,
          points: pts.get(norm(o.en)) ?? 0,
          ...(romanceOpts.has(`${r}|${norm(o.en)}`) ? { romance: true } : {}),
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
    const rank = { rank: r, conversations, unlocks: unlocks.get(r) ?? [] };
    if (!conversations.length) rank.choicesDontMatter = true;
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
