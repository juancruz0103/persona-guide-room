import { useMemo, useState } from 'react';
import { CalcHeader } from '../components/CalcHeader';
import { PersonaPeek } from '../components/PersonaPeek';
import { getArcana } from '../data/arcana';
import heartsJson from '../data/generated/hearts-es.json';
import { getAllPersonas } from '../services/personas';
import { itemName } from '../services/text';
import styles from './Fusion.module.css';
import { L } from '../../../i18n';

const HEARTS = heartsJson as Record<string, { es: string; desc: string | null }>;
export const heartDescription = (item: string) => HEARTS[item.replace('’', "'")]?.desc ?? null;

/** Objetos de corazón: qué Persona da cada uno y a qué nivel. */
export default function Hearts() {
  const [q, setQ] = useState('');
  const list = useMemo(() => {
    const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    return getAllPersonas()
      .filter((p) => p.heart && !p.party)
      .filter((p) => !q || norm(itemName(p.heart!.item)).includes(norm(q)) || norm(p.nameEs ?? p.name).includes(norm(q)))
      .sort((a, b) => a.heart!.level - b.heart!.level);
  }, [q]);
  return (
    <>
      <CalcHeader />
      <div className={`container ${styles.page}`}>
        <p className={styles.hint}>
          {L('Algunas Personas dan un objeto de corazón al llegar a cierto nivel. Acá están todos, del primero que se puede conseguir al último.', 'Some Personas give a heart item when they reach a certain level. Here they all are, from earliest to latest.')}
        </p>
        <label style={{ display: 'grid', gap: 6, maxWidth: 420 }}>
          <span className="label label-accent">{L('Buscar objeto o Persona', 'Search item or Persona')}</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} className={styles.select} />
        </label>
        <section className={styles.listBox}>
          <ul className={styles.rows}>
            {list.map((p) => (
              <li key={p.id} style={{ gridTemplateColumns: '1.2fr 1fr 2fr' }}>
                <span><strong>{itemName(p.heart!.item)}</strong></span>
                <span><PersonaPeek persona={p} below /> <small>{getArcana(p.arcana).name} · {L('Nv', 'Lv')} {p.heart!.level}</small></span>
                <span><small>{heartDescription(p.heart!.item) ?? ''}</small></span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
