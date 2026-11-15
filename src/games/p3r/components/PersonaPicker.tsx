import { ARCANAS, getArcana } from '../data/arcana';
import { personaName } from '../services/text';
import type { Persona } from '../types';
import { L } from '../../../i18n';

/** Selector de Persona agrupado por Arcana. */
export function PersonaPicker({ id, label, list, value, onChange, className }: {
  id: string; label: string; list: Persona[]; value: string; onChange: (id: string) => void; className?: string;
}) {
  return (
    <label htmlFor={id} style={{ display: 'grid', gap: 6 }}>
      <span className="label label-accent">{label}</span>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={className}>
        <option value="">{L('Elegí una Persona…', 'Choose a Persona…')}</option>
        {ARCANAS.map((a) => {
          const group = list.filter((p) => p.arcana === a.id).sort((x, y) => x.level - y.level);
          if (!group.length) return null;
          return (
            <optgroup key={a.id} label={getArcana(a.id).name}>
              {group.map((p) => (
                <option key={p.id} value={p.id}>{personaName(p)} · {L('Nv', 'Lv')} {p.level}</option>
              ))}
            </optgroup>
          );
        })}
      </select>
    </label>
  );
}
