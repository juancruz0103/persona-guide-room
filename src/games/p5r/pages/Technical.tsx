import { BackButton } from '../../../shared/components/BackButton';
import { ElementIcon, type IconKey } from '../../../shared/components/ElementIcon';
import { SectionTitle } from '../../../shared/components/SectionTitle';
import { SkillCardKindIcon } from '../components/SkillCardKindIcon';
import { AILMENTS, ELEMENTS, TECHNICAL_CHART } from '../data/elements';
import type { SkillCardFilter } from '../services/items';
import type { SkillElement } from '../types';
import styles from './Technical.module.css';

const ALL_ICONS: SkillElement[] = [
  'phy', 'gun', 'fir', 'ice', 'ele', 'win', 'psy', 'nuk', 'ble', 'cur', 'alm', 'ail', 'rec', 'sup', 'pas',
];

const CARD_KINDS: { kind: SkillCardFilter; name: string; text: string; tone: string }[] = [
  { kind: 'normal', name: 'Fusión normal', text: 'Sale al ejecutar la Persona.', tone: 'var(--c-paper)' },
  { kind: 'alarm', name: 'Alarma de fusión', text: 'Hay que ejecutar con la alarma activa.', tone: 'var(--c-primary)' },
  { kind: 'excl', name: 'Exclusiva', text: 'No existe como skill card.', tone: 'var(--c-accent)' },
];

function Chip({ el, gold }: { el: IconKey; gold?: boolean }) {
  const name = el === 'any' ? 'Cualquier elemento' : ELEMENTS[el].name;
  return (
    <span className={`${styles.chip} ${gold ? styles.chipGold : ''}`} title={gold ? 'Requiere «Entender el corazón»' : undefined}>
      <ElementIcon element={el} size={20} />
      {name}
    </span>
  );
}

export default function Technical() {
  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.back}>
        <BackButton fallback="/p5r" />
      </div>

      <section>
        <SectionTitle as="h1">Íconos de elementos</SectionTitle>
        <p className={styles.lead}>
          Diseño propio, con el mismo código de colores del juego para que se reconozcan al instante. Se usan en la
          calculadora, las fichas de Persona y la página de skill cards (también como filtro por elemento).
        </p>
        <ul className={styles.icons}>
          {ALL_ICONS.map((el) => (
            <li key={el} className={styles.icon} style={{ borderBottomColor: ELEMENTS[el].color }}>
              <ElementIcon element={el} size={48} />
              <span className="label">{ELEMENTS[el].name}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <SectionTitle tone="paper" size="md">Skill cards y costos</SectionTitle>
        <p className={styles.lead}>
          Cómo se consigue la skill card en la silla eléctrica. Son los filtros de la página de skill cards.
        </p>
        <ul className={styles.kinds}>
          {CARD_KINDS.map((k) => (
            <li key={k.kind} className={styles.kind} style={{ borderBottomColor: k.tone }}>
              <SkillCardKindIcon kind={k.kind} size={40} />
              <span className={styles.kindText}>
                <span className={styles.kindName}>{k.name}</span>
                <span className={styles.kindDesc}>{k.text}</span>
              </span>
            </li>
          ))}
          <li className={styles.kind} style={{ borderBottomColor: '#333' }}>
            <span className={styles.cost}>
              <span style={{ color: 'var(--c-hp)' }}>HP</span>
              <span className={styles.slash}>/</span>
              <span style={{ color: 'var(--c-sp)' }}>SP</span>
            </span>
            <span className={styles.kindText}>
              <span className={styles.kindName}>Costo</span>
              <span className={styles.kindDesc}>Verde como la barra de HP; violeta como la de SP.</span>
            </span>
          </li>
        </ul>
      </section>

      <section>
        <SectionTitle tone="accent" size="md">Tabla de Técnicos · P5 Royal</SectionTitle>
        <p className={styles.lead}>
          Si el enemigo tiene un estado alterado y lo atacás con uno de estos elementos, hacés un{' '}
          <strong>Técnico</strong>: más daño y, en Royal, chance de derribarlo.
        </p>
        <div className={styles.book}>
          <span className={`${styles.chip} ${styles.chipGold} ${styles.bookTag}`}>Borde dorado</span>
          <span className={styles.bookText}>
            <span>
              Los elementos con <strong className={styles.gold}>borde dorado</strong> son exclusivos de Royal: solo
              hacen Técnico después de leer el libro <strong>Entender el corazón</strong>.
            </span>
            <span className={styles.bookHow}>
              <strong>Cómo conseguirlo:</strong> se compra por ¥12.000 en la <strong>Librería Nagiuri</strong> de
              Jinbocho. Antes hay que comprar y terminar de leer los otros cinco libros de esa librería (¥8.000 cada uno:
              Maestro espadachín, Llámame Jefe, Casanova osado, Revelaciones heroicas e Introducción al karakuri); al
              leerlos todos se desbloquea.
            </span>
          </span>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Estado</th>
                <th scope="col">Técnico con</th>
              </tr>
            </thead>
            <tbody>
              {TECHNICAL_CHART.map((r) => (
                <tr key={r.ailment}>
                  <th scope="row">
                    <span className={styles.ailment}>{AILMENTS[r.ailment].es}</span>
                    <span className={styles.en}>{AILMENTS[r.ailment].en}</span>
                  </th>
                  <td>
                    <span className={styles.chips}>
                      {r.base.map((e) => <Chip key={e} el={e} />)}
                      {r.knowingTheHeart.map((e) => <Chip key={`k-${e}`} el={e} gold />)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={styles.note}>
          Combinaciones: Megami Tensei Wiki (página “Technical”). Nombres de los estados y del libro: textos
          oficiales de la versión en español del juego.
        </p>
      </section>
    </div>
  );
}
