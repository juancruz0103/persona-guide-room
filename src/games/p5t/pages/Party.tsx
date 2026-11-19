import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSessionState } from '../../../shared/hooks/useSessionState';
import header from '../../p5r/components/CalculatorHeader.module.css';
import { getMember, getParty, tx } from '../services/party';
import { typeName } from '../services/personas';
import type { Member, TreeNode, Weapon } from '../types';
import styles from './Party.module.css';
import { L } from '../../../i18n';

const CW = 120; // ancho de cada columna del árbol
const RH = 84; // alto de cada fila
const NW = 104;
const NH = 58;

type Tab = 'tree' | 'skills' | 'weapons';

function Tree({ m, index, selected, onSelect }: { m: Member; index: number; selected?: string; onSelect: (n: TreeNode) => void }) {
  const nodes = m.nodes.filter((n) => n.tree === index);
  if (!nodes.length) return null;
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const minX = Math.min(...nodes.map((n) => n.x));
  const cx = (n: TreeNode) => (n.x - minX) * CW + NW / 2;
  const cy = (n: TreeNode) => n.y * RH + NH / 2;
  const width = (Math.max(...nodes.map((n) => n.x)) - minX) * CW + NW;
  const height = Math.max(...nodes.map((n) => n.y)) * RH + NH;
  return (
    <section className={styles.tree}>
      <h2 className={styles.treeName}>{tx(m.trees[index])}</h2>
      <div className={styles.scroll}>
        <div className={styles.canvas} style={{ width, height }}>
          <svg className={styles.lines} width={width} height={height} aria-hidden="true">
            {nodes.flatMap((n) => n.parents.map((p) => byId.get(p)).filter((p): p is TreeNode => !!p)
              .map((p) => <line key={`${p.id}-${n.id}`} x1={cx(p)} y1={cy(p)} x2={cx(n)} y2={cy(n)} />))}
          </svg>
          {nodes.map((n) => (
            <button key={n.id} type="button" onClick={() => onSelect(n)} aria-pressed={selected === n.id}
              className={`${styles.node} ${styles[n.kind] ?? ''} ${n.strongest ? styles.strongest : ''} ${selected === n.id ? styles.selected : ''}`}
              style={{ left: cx(n) - NW / 2, top: cy(n) - NH / 2 }}>
              <span className={styles.nodeName}>{tx(n.name)}</span>
              <span className={styles.cost}>{n.cost ? `${n.cost} PC` : L('Inicial', 'Starting')}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function NodeDetail({ m, n }: { m: Member; n: TreeNode }) {
  const parents = n.parents.map((p) => m.nodes.find((x) => x.id === p)).filter((x): x is TreeNode => !!x);
  return (
    <div className={styles.detail} aria-live="polite">
      <h3>{tx(n.name)}</h3>
      <p>{tx(n.desc)}</p>
      <p className={styles.facts}>
        {n.cost ? `${n.cost} PC` : L('Viene desbloqueada', 'Unlocked from the start')}
        {parents.length > 0 && <> · {L('Requiere', 'Requires')}: {parents.map((p) => tx(p.name)).join(L(' o ', ' or '))}</>}
        {n.quest && <> · {L('Se habilita con una misión', 'Unlocked by a quest')}</>}
      </p>
    </div>
  );
}

function Skills({ m }: { m: Member }) {
  if (!m.personaSkills.length) return <p className="pending">{L('Su Persona no aprende habilidades de combate.', "Their Persona doesn't learn combat skills.")}</p>;
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>{L('Habilidad', 'Skill')}</th>
            <th>{L('Daño', 'Damage')}</th>
            <th>{L('Costo', 'Cost')}</th>
            <th>{L('Alcance', 'Range')}</th>
            <th>{L('Estado', 'Ailment')}</th>
          </tr>
        </thead>
        <tbody>
          {m.personaSkills.map((s) => (
            <tr key={s.id}>
              <td><strong>{tx(s.name)}</strong><small>{tx(s.desc)}</small></td>
              <td>{s.damage ? `${s.damage[0]}–${s.damage[1]}` : '—'}</td>
              <td>{s.cost ? `${s.cost} ${s.costType === 'hp' ? L('PS', 'HP') : L('PE', 'SP')}` : '—'}</td>
              <td>{s.range && s.range > 0 ? s.range : '—'}</td>
              <td>{s.ailment ? typeName(s.ailment) : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const variantText = (v: Weapon['variants'][number]) =>
  [`${L('Daño', 'Damage')} ${v.damage[0]}–${v.damage[1]}`, v.range ? `${L('Alcance', 'Range')} ${v.range}` : null,
    v.ailment ? `${typeName(v.ailment)} ${v.ailmentRate}%` : null].filter(Boolean).join(' · ');

function weaponSource(w: Weapon) {
  switch (w.source) {
    case 'fusion':
      return <>{L('Fusión de armas', 'Weapon fusion')}: {w.recipe!.map((r) => `${typeName(r.type)} ${L('Nv', 'Lv')} ${r.level}+`).join(' + ')}</>;
    case 'shop':
      return <>{L('Se compra en la tienda', 'Sold in the shop')}: ¥{w.price!.toLocaleString('es-AR')}</>;
    case 'initial':
      return L('Arma inicial.', 'Starting weapon.');
    case 'dlc':
      return L('Viene con un DLC.', 'Comes with DLC.');
    default:
      return null;
  }
}

function Weapons({ m }: { m: Member }) {
  if (!m.weapons.length) return <p className="pending">{L('No usa armas: guía al grupo desde fuera del combate.', "No weapons: guides the party from outside the battle.")}</p>;
  return (
    <>
      <p className={styles.facts}>
        {L('Valores base del juego. En tu partida se ven más altos por el nivel del personaje y las mejoras del árbol (por ejemplo, Ojo de halcón suma alcance).',
          "The game's base values. In your save they look higher because of the character's level and tree upgrades (Hawk Eye adds range, for example).")}
      </p>
      <div className={styles.weapons}>
        {m.weapons.map((w) => {
          const [first, ...rest] = w.variants;
          return (
            <article key={w.id} className={`${styles.weapon} ${w.recipe ? styles.weaponMade : ''}`}>
              <h3>{tx(w.name)}</h3>
              <div className={styles.stats}>{variantText(first)}</div>
              {rest.length > 0 && (
                <p>{L('Otras versiones al fabricarla', 'Other versions when crafted')}: {rest.map(variantText).join(' / ')}</p>
              )}
              <p>{weaponSource(w)}</p>
            </article>
          );
        })}
      </div>
    </>
  );
}

export default function Party() {
  const { memberId = 'joker' } = useParams();
  const m = getMember(memberId);
  const [tab, setTab] = useSessionState<Tab>('p5t.party.tab', 'tree');
  const [sel, setSel] = useState<TreeNode | null>(null);
  const TABS: [Tab, string][] = [
    ['tree', L('Árbol de habilidades', 'Skill tree')],
    ['skills', m?.persona ? L(`Habilidades de ${tx(m.persona)}`, `${tx(m.persona)}'s skills`) : L('Habilidades', 'Skills')],
    ['weapons', L('Armas', 'Weapons')],
  ];

  return (
    <>
      <section className={header.band}>
        <div className={`container ${header.inner}`}>
          <h1 className={header.title}>{L('Ladrones Fantasma', 'Phantom Thieves')}</h1>
        </div>
      </section>
      <div className="container">
        <nav className={styles.members} aria-label={L('Miembros del grupo', 'Party members')}>
          {getParty().map((x) => (
            <Link key={x.id} to={`/p5t/ladrones/${x.id}`} onClick={() => setSel(null)} aria-current={x.id === memberId ? 'page' : undefined}
              className={`${styles.member} ${x.id === memberId ? styles.memberOn : ''}`}>{tx(x.codename)}</Link>
          ))}
        </nav>
        {!m ? (
          <p className="pending">{L('No encontramos ese personaje.', "We couldn't find that character.")}</p>
        ) : (
          <>
            <header className={styles.head}>
              <span className={styles.code}>{tx(m.codename)}</span>
              <span className={styles.facts}>
                {tx(m.name)}{m.persona && <> · Persona: {tx(m.persona)}</>} · {L('PS', 'HP')} {m.stats.hp} · {L('PE', 'SP')} {m.stats.sp} · {L('Movimiento', 'Move')} {m.stats.move}
              </span>
            </header>
            <div className={styles.tabs} role="tablist">
              {TABS.map(([id, label]) => (
                <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
                  className={`btn ${tab === id ? 'btn--dark' : 'btn--light'}`}>{label}</button>
              ))}
            </div>
            {tab === 'tree' && (
              <>
                <div className={styles.trees}>
                  {m.trees.map((_, i) => <Tree key={i} m={m} index={i} selected={sel?.id} onSelect={setSel} />)}
                </div>
                {sel && m.nodes.includes(sel) ? (
                  <NodeDetail m={m} n={sel} />
                ) : (
                  <p className={styles.facts} style={{ marginTop: 16 }}>{L('Tocá una habilidad para ver qué hace y qué necesita.', 'Tap a skill to see what it does and what it needs.')}</p>
                )}
                <div className={styles.legend}>
                  <span><i className={styles.swatch} style={{ borderColor: 'var(--c-primary)' }} />{L('Habilidad de la Persona', 'Persona skill')}</span>
                  <span><i className={styles.swatch} style={{ borderColor: 'var(--c-accent)' }} />{L('Pasiva', 'Passive')}</span>
                  <span><i className={styles.swatch} style={{ borderColor: 'var(--c-primary)', background: 'var(--c-primary)' }} />{L('La más fuerte de la rama', 'Strongest in the branch')}</span>
                </div>
              </>
            )}
            {tab === 'skills' && <Skills m={m} />}
            {tab === 'weapons' && <Weapons m={m} />}
          </>
        )}
      </div>
      <div style={{ height: 48 }} />
    </>
  );
}
