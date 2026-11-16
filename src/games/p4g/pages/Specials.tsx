import { Link } from 'react-router-dom';
import { CalcHeader } from '../components/CalcHeader';
import { getArcana } from '../data/arcana';
import { getFusionEngine } from '../fusion';
import { personaName } from '../services/text';
import { PersonaPeek } from '../components/PersonaPeek';
import styles from './Fusion.module.css';
import { L } from '../../../i18n';

export default function Specials() {
  const engine = getFusionEngine();
  const list = engine.ingredients().filter((p) => p.flags.special).sort((a, b) => a.level - b.level);
  return (
    <>
      <CalcHeader />
      <div className={`container ${styles.page}`}>
        <p className={styles.hint}>{L('Estas Personas solo salen juntando a todos sus ingredientes a la vez.', 'These Personas only come from fusing all their ingredients at once.')}</p>
        {list.map((p) => (
          <section key={p.id} className={styles.listBox}>
            <h2 className={styles.h2}>
              <Link to={`/p4g/calculadora/persona/${p.id}`} style={{ color: 'inherit' }}>{personaName(p)}</Link>{' '}
              <small style={{ color: 'var(--c-text-dim)' }}>{getArcana(p.arcana).name} · {L('Nv', 'Lv')} {p.level}</small>
            </h2>
            <p style={{ margin: 0, fontFamily: 'var(--f-label)', fontSize: 18 }}>
              {engine.specialRecipe(p)!.map((s, i) => (
                <span key={s.id}>{i > 0 && <b style={{ color: 'var(--c-primary)' }}> + </b>}<PersonaPeek persona={s} below /></span>
              ))}
            </p>
          </section>
        ))}
      </div>
    </>
  );
}
