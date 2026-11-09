import { ARCANAS } from '../data/arcana';
import type { Persona } from '../types';
import { personaName } from '../services/gameText';

interface Props {
  id: string;
  value: string;
  options: Persona[];
  onChange: (id: string) => void;
  className?: string;
  placeholder?: string;
}

/** Selector de Persona agrupado por Arcana (en orden de nivel). */
export function PersonaSelect({ id, value, options, onChange, className, placeholder }: Props) {
  return (
    <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={className}>
      {placeholder && <option value="">{placeholder}</option>}
      {ARCANAS.map((a) => {
        const group = options.filter((p) => p.arcana === a.id).sort((x, y) => x.level - y.level);
        if (!group.length) return null;
        return (
          <optgroup key={a.id} label={a.name}>
            {group.map((p) => (
              <option key={p.id} value={p.id}>
                {personaName(p)} · Nv {p.level}
                {p.flags.dlc ? ' · DLC' : ''}
                {p.flags.treasure ? ' · Tesoro' : ''}
              </option>
            ))}
          </optgroup>
        );
      })}
    </select>
  );
}
