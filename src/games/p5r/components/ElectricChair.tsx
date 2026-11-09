import { useId } from 'react';
import { MATERIAL, getItem, itemDescription, itemTypeLabel } from '../services/items';
import type { Persona } from '../types';
import { ItemIcon } from './ItemIcon';
import styles from './ElectricChair.module.css';

function ItemCard({ name, alarm }: { name: string; alarm: boolean }) {
  const tipId = useId();
  const item = getItem(name) ?? { name, type: 'unknown' as const, source: null };
  const typeLabel = itemTypeLabel(item);
  const material = MATERIAL[item.type];
  const { lines, note } = itemDescription(item);

  return (
    <div className={`${styles.card} ${alarm ? styles.alarm : styles.normal}`}>
      <span className={styles.tipWrap} tabIndex={0} aria-label={`${name}: ver descripción`} aria-describedby={tipId}>
        <span className={styles.icon}>
          <ItemIcon item={item} />
        </span>
        <span role="tooltip" id={tipId} className={styles.tip}>
          <span className={styles.tipTitle}>{name}</span>
          <span className={styles.tipType}>{typeLabel}</span>
          {lines.map((l, i) => (
            <span key={i} className={styles.tipText}>
              {l.text}
              {l.cost && (
                <>
                  {' '}
                  Costo: <strong className={l.cost.kind === 'hp' ? 'cost-hp-dark' : 'cost-sp-dark'}>{l.cost.text}</strong>.
                </>
              )}
            </span>
          ))}
          {note && <span className={styles.tipNote}>{note}</span>}
        </span>
      </span>
      <span className={styles.body}>
        <span className={styles.kind}>
          {alarm ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M12 2a7 7 0 0 0-7 7v5l-2 3h18l-2-3V9a7 7 0 0 0-7-7zm-2.5 17a2.5 2.5 0 0 0 5 0z" />
              </svg>
              Con Alarma de fusión
            </>
          ) : (
            'Normal'
          )}
        </span>
        <span className={styles.name}>{name}</span>
        <span className={styles.meta}>
          {typeLabel}
          {material && ` · Material: ${material}`}
        </span>
      </span>
    </div>
  );
}

/** Item que se obtiene al ejecutar a la Persona en el Velvet Room. */
export function ElectricChair({ persona: p }: { persona: Persona }) {
  if (!p.itemization) {
    return <p className={styles.help}>Esta Persona no se puede ejecutar en la silla eléctrica.</p>;
  }
  return (
    <div className={styles.wrap}>
      <p className={styles.help}>
        Item que obtenés al ejecutar a {p.name} en el Velvet Room. Con la Alarma de fusión activa (menú en rojo) sale
        una versión mejor. Pasá el mouse por el ícono para ver qué hace.
      </p>
      <ItemCard name={p.itemization} alarm={false} />
      {p.itemizationAlt && p.itemizationAlt !== p.itemization && <ItemCard name={p.itemizationAlt} alarm />}
    </div>
  );
}
