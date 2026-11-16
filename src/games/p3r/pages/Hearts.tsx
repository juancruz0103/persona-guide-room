import { useMemo, useState } from 'react';
import { CalcHeader } from '../components/CalcHeader';
import { PersonaPeek } from '../components/PersonaPeek';
import { CharacterPeek } from '../components/CharacterPeek';
import { findCharacter } from '../data/characters';
import heartsJson from '../data/generated/hearts-es.json';
import recipesJson from '../data/generated/heart-recipes.json';
import { getAllPersonas } from '../services/personas';
import { DESC_EN, itemName } from '../services/text';
import type { Persona } from '../types';
import styles from './Hearts.module.css';
import { L, isEn } from '../../../i18n';

const HEARTS = heartsJson as Record<string, { es: string; desc: string | null }>;
interface Item { en: string; es: string; kind: 'weapon' | 'armor' | 'shoes' | 'accessory' | 'material'; stats?: Record<string, number>; desc?: string }
interface Recipe { result: Item; materials: { item: string; n: number }[] }
const DATA = recipesJson as unknown as { recipes: Record<string, Recipe[]>; materials: Record<string, string> };
const key = (s: string) => s.replace('’', "'");
export const heartDescription = (item: string) => (isEn() ? DESC_EN.hearts?.[key(item)] : HEARTS[key(item)]?.desc) ?? null;

const KIND = (k: Item['kind']) =>
  ({ weapon: L('Arma', 'Weapon'), armor: L('Armadura', 'Armor'), shoes: L('Calzado', 'Footwear'), accessory: L('Accesorio', 'Accessory'), material: L('Material', 'Material') })[k];
const STAT = (s: string) =>
  ({ Attack: L('Ataque', 'Attack'), Accuracy: L('Precisión', 'Accuracy'), Defence: L('Defensa', 'Defense'), Evasion: L('Evasión', 'Evasion'),
     Strength: L('Fu', 'St'), Magic: 'Ma', Endurance: L('Re', 'En'), Agility: 'Ag', Luck: L('Su', 'Lu') } as Record<string, string>)[s] ?? s;
const matName = (en: string) => L(DATA.materials[en] ?? en, en);

/** "Para Sanada." → "Para <Akihiko Sanada con foto>." ; "Para ." (nombre del protagonista) → "Para el protagonista." */
function GearDesc({ text }: { text: string }) {
  const m = text.match(/^(.*?)([Pp]ara) ([^.]*)\.(.*)$/);
  const who = m ? findCharacter(m[3]) : undefined;
  if (!m || !who) return <small>{text}</small>;
  const para = m[2] === 'Para' ? L('Para', 'For') : L('para', 'for');
  return <small>{m[1]}{para} <CharacterPeek character={who} />.{m[4]}</small>;
}

/** Objetos de corazón: qué Persona los da y qué equipo se fabrica con ellos en Mayoido Antiques. */
export default function Hearts() {
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<'level' | 'az'>('level');
  const groups = useMemo(() => {
    const by = new Map<string, Persona[]>();
    for (const p of getAllPersonas()) if (p.heart && !p.party) by.set(key(p.heart.item), [...(by.get(key(p.heart.item)) ?? []), p]);
    const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    return [...by.entries()]
      .map(([item, personas]) => ({ item, personas: personas.sort((a, b) => a.heart!.level - b.heart!.level), recipes: DATA.recipes[item] ?? [] }))
      .filter((g) => !q || [itemName(g.item), ...g.personas.map((p) => p.nameEs ?? p.name), ...g.recipes.map((r) => L(r.result.es, r.result.en))].some((s) => norm(s).includes(norm(q))))
      .sort((a, b) => sort === 'az' ? itemName(a.item).localeCompare(itemName(b.item)) : a.personas[0].heart!.level - b.personas[0].heart!.level);
  }, [q, sort]);

  return (
    <>
      <CalcHeader />
      <div className={`container ${styles.page}`}>
        <p className={styles.lead}>
          {L('Algunas Personas dan un objeto de corazón al llegar a cierto nivel. Con ellos se fabrica equipo exclusivo en Mayoido Antiques (centro comercial Paulownia).', 'Some Personas give a heart item at a certain level. They are used to craft exclusive gear at Mayoido Antiques (Paulownia Mall).')}
        </p>
        <label className={styles.search}>
          <span className="label label-accent">{L('Buscar objeto, Persona o equipo', 'Search item, Persona or gear')}</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <label className={styles.search}>
          <span className="label label-accent">{L('Ordenar por', 'Sort by')}</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as 'level' | 'az')}>
            <option value="level">{L('Nivel en que se consigue', 'Level obtained')}</option>
            <option value="az">{L('Nombre (A–Z)', 'Name (A–Z)')}</option>
          </select>
        </label>
        {groups.map((g) => (
          <details key={g.item} className={styles.card}>
            <summary>
              <span className={styles.name}>{itemName(g.item)}</span>
              <span className={styles.from}>
                {g.personas.map((p, i) => (
                  <span key={p.id}>{i > 0 && ', '}<PersonaPeek persona={p} below /> <small>({L('Nv', 'Lv')} {p.heart!.level})</small></span>
                ))}
              </span>
              <span className={styles.count}>{g.recipes.length === 1 ? L('1 receta', '1 recipe') : g.recipes.length ? L(`${g.recipes.length} recetas`, `${g.recipes.length} recipes`) : ''}</span>
            </summary>
            {heartDescription(g.item) && <p className={styles.desc}>{heartDescription(g.item)}</p>}
            <ul className={styles.recipes}>
              {g.recipes.map((r, i) => (
                <li key={i}>
                  <div className={styles.result}>
                    <span className={styles.kind}>{KIND(r.result.kind)}</span>
                    <strong>{L(r.result.es, r.result.en)}</strong>
                    {r.result.stats && (
                      <span className={styles.stats}>
                        {Object.entries(r.result.stats).map(([k, v]) => <span key={k}>{STAT(k)} <b>{v}</b></span>)}
                      </span>
                    )}
                    {r.result.desc && <GearDesc text={r.result.desc} />}
                  </div>
                  <div className={styles.mats}>
                    {r.materials.map((m) => (
                      <span key={m.item} className={key(m.item) === g.item ? styles.heartMat : ''}>{matName(m.item)} ×{m.n}</span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>
    </>
  );
}
