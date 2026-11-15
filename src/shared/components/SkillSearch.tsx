import { useMemo, useState } from 'react';
import styles from './SkillSearch.module.css';

export interface SkillOption {
  key: string;
  /** Nombre que se muestra (idioma actual). */
  label: string;
  /** Otros nombres por los que también se puede buscar (ej. el inglés). */
  alt?: string;
}

const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Busca por todas las palabras escritas, en cualquier parte del nombre y sin tildes. */
export function searchSkills(options: SkillOption[], text: string, max = 8): SkillOption[] {
  const words = fold(text.trim()).split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  return options
    .filter((o) => {
      const h = fold(`${o.label} ${o.alt ?? ''}`);
      return words.every((w) => h.includes(w));
    })
    .sort((a, b) => Number(!fold(a.label).startsWith(words[0])) - Number(!fold(b.label).startsWith(words[0])))
    .slice(0, max);
}

/**
 * Buscador de habilidades: encuentra por cualquier parte del nombre, sin importar tildes
 * ni idioma («unico» → «Potenciación de objetivo único»).
 */
export function SkillSearch({ options, value, onChange, placeholder, keepText = true }: {
  options: SkillOption[];
  value?: string;
  onChange: (key: string) => void;
  placeholder?: string;
  /** false = se vacía al elegir (para agregar varias). */
  keepText?: boolean;
}) {
  const current = options.find((o) => o.key === value);
  const [text, setText] = useState(current?.label ?? '');
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const matches = useMemo(() => searchSkills(options, text), [options, text]);

  const pick = (o: SkillOption) => {
    onChange(o.key);
    setText(keepText ? o.label : '');
    setOpen(false);
  };

  return (
    <div className={styles.wrap}>
      <input
        value={text}
        placeholder={placeholder}
        onChange={(e) => {
          setText(e.target.value);
          setOpen(true);
          setHi(0);
          const exact = options.find((o) => fold(o.label) === fold(e.target.value.trim()) || fold(o.alt ?? '') === fold(e.target.value.trim()));
          if (keepText) onChange(exact?.key ?? '');
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => {
          if (!open || !matches.length) return;
          if (e.key === 'ArrowDown') { e.preventDefault(); setHi((hi + 1) % matches.length); }
          if (e.key === 'ArrowUp') { e.preventDefault(); setHi((hi - 1 + matches.length) % matches.length); }
          if (e.key === 'Enter') { e.preventDefault(); pick(matches[hi]); }
          if (e.key === 'Escape') setOpen(false);
        }}
        role="combobox"
        aria-expanded={open && matches.length > 0}
        aria-autocomplete="list"
      />
      {open && matches.length > 0 && (
        <ul className={styles.list} role="listbox">
          {matches.map((o, i) => (
            <li key={o.key} role="option" aria-selected={i === hi}>
              <button type="button" className={i === hi ? styles.hi : ''} onMouseDown={(e) => e.preventDefault()} onClick={() => pick(o)}>
                {o.label}
                {o.alt && o.alt !== o.label && <small>{o.alt}</small>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
