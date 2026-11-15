import { BackButton } from '../../../shared/components/BackButton';
import { ElementIcon, type IconKey } from '../../../shared/components/ElementIcon';
import { SectionTitle } from '../../../shared/components/SectionTitle';
import { SkillCardKindIcon } from '../components/SkillCardKindIcon';
import { AILMENTS, ELEMENTS, TECHNICAL_CHART, ailmentName } from '../data/elements';
import { isEn, L } from '../../../i18n';
import type { SkillCardFilter } from '../services/items';
import type { SkillElement } from '../types';
import styles from './Technical.module.css';

const ALL_ICONS: SkillElement[] = [
  'phy', 'gun', 'fir', 'ice', 'ele', 'win', 'psy', 'nuk', 'ble', 'cur', 'alm', 'ail', 'rec', 'sup', 'pas',
];

const CARD_KINDS = (): { kind: SkillCardFilter; name: string; text: string; tone: string }[] => [
  { kind: 'normal', name: L('Fusión normal', 'Normal fusion'), text: L('Sale al ejecutar la Persona.', 'You get it by executing the Persona.'), tone: 'var(--c-paper)' },
  { kind: 'alarm', name: L('Alarma de fusión', 'Fusion Alarm'), text: L('Hay que ejecutar con la alarma activa.', 'You have to execute with the alarm active.'), tone: 'var(--c-primary)' },
  { kind: 'excl', name: L('Exclusiva', 'Exclusive'), text: L('No existe como skill card.', 'It does not exist as a skill card.'), tone: 'var(--c-accent)' },
];

function Chip({ el, gold }: { el: IconKey; gold?: boolean }) {
  const name = el === 'any' ? L('Cualquier elemento', 'Any element') : ELEMENTS[el].name;
  return (
    <span className={`${styles.chip} ${gold ? styles.chipGold : ''}`} title={gold ? L('Requiere «Entender el corazón»', 'Requires «Understanding the Heart»') : undefined}>
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
        <SectionTitle as="h1">{L('Íconos de elementos', 'Element icons')}</SectionTitle>
        <p className={styles.lead}>
          {L('Diseño propio, con el mismo código de colores del juego para que se reconozcan al instante. Se usan en la calculadora, las fichas de Persona y la página de skill cards (también como filtro por elemento).', 'Our own design, with the same color code as the game so you recognize them instantly. They are used in the calculator, the Persona profiles and the skill cards page (also as an element filter).')}
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
        <SectionTitle tone="paper" size="md">{L('Skill cards y costos', 'Skill cards and costs')}</SectionTitle>
        <p className={styles.lead}>
          {L('Cómo se consigue la skill card en la silla eléctrica. Son los filtros de la página de skill cards.', 'How you get the skill card in the electric chair. These are the filters on the skill cards page.')}
        </p>
        <ul className={styles.kinds}>
          {CARD_KINDS().map((k) => (
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
              <span className={styles.kindName}>{L('Costo', 'Cost')}</span>
              <span className={styles.kindDesc}>{L('Verde como la barra de HP; violeta como la de SP.', 'Green like the HP bar; violet like the SP bar.')}</span>
            </span>
          </li>
        </ul>
      </section>

      <section>
        <SectionTitle tone="accent" size="md">{L('Tabla de Técnicos · P5 Royal', 'Technical chart · P5 Royal')}</SectionTitle>
        <p className={styles.lead}>
          {L('Si el enemigo tiene un estado alterado y lo atacás con uno de estos elementos, hacés un', 'If the enemy has an ailment and you hit it with one of these elements, you land a')}{' '}
          <strong>{L('Técnico', 'Technical')}</strong>
          {L(': más daño y, en Royal, chance de derribarlo.', ': more damage and, in Royal, a chance to knock it down.')}
        </p>
        <div className={styles.book}>
          <span className={`${styles.chip} ${styles.chipGold} ${styles.bookTag}`}>{L('Borde dorado', 'Gold border')}</span>
          <span className={styles.bookText}>
            <span>
              {L('Los elementos con', 'Elements with a')} <strong className={styles.gold}>{L('borde dorado', 'gold border')}</strong>{' '}
              {L('son exclusivos de Royal: solo hacen Técnico después de leer el libro', 'are Royal exclusive: they only trigger a Technical after reading the book')}{' '}
              <strong>{L('Entender el corazón', 'Understanding the Heart')}</strong>.
            </span>
            <span className={styles.bookHow}>
              <strong>{L('Cómo conseguirlo:', 'How to get it:')}</strong>{' '}
              {L(
                'se compra por ¥12.000 en la Librería Nagiuri de Jinbocho. Antes hay que comprar y terminar de leer los otros cinco libros de esa librería (¥8.000 cada uno: Maestro espadachín, Llámame Jefe, Casanova osado, Revelaciones heroicas e Introducción al karakuri); al leerlos todos se desbloquea.',
                'it costs ¥12,000 at the Nagiuri bookstore in Jinbocho. First you have to buy and finish the other five books in that store (¥8,000 each); once you have read them all, it unlocks.',
              )}
            </span>
          </span>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">{L('Estado', 'Ailment')}</th>
                <th scope="col">{L('Técnico con', 'Technical with')}</th>
              </tr>
            </thead>
            <tbody>
              {TECHNICAL_CHART.map((r) => (
                <tr key={r.ailment}>
                  <th scope="row">
                    <span className={styles.ailment}>{ailmentName(r.ailment)}</span>
                    {!isEn() && <span className={styles.en}>{AILMENTS[r.ailment].en}</span>}
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
      </section>
    </div>
  );
}
