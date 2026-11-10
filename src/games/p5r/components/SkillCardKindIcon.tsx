import type { SkillCardFilter } from '../services/items';

/** Ícono de cada tipo de skill card: carta blanca (normal), carta roja (alarma), estrella dorada (exclusiva). */
export function SkillCardKindIcon({ kind, size = 22, className }: { kind: SkillCardFilter; size?: number; className?: string }) {
  if (kind === 'all') return null;
  if (kind === 'excl')
    return (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        <path fill="var(--c-accent)" d="M12 2l3 6.3 6.9.9-5 4.8 1.2 6.8L12 17.6l-6.1 3.2 1.2-6.8-5-4.8 6.9-.9z" />
      </svg>
    );
  return (
    <svg className={className} width={Math.round((size * 17) / 22)} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="1" width="16" height="22" fill={kind === 'alarm' ? 'var(--c-primary)' : 'var(--c-paper)'} stroke="var(--c-ink)" strokeWidth="1.5" />
      <path fill={kind === 'alarm' ? 'var(--c-text)' : 'var(--c-ink)'} d="M12 6l1.6 3.3 3.6.5-2.6 2.5.6 3.6L12 14.2l-3.2 1.7.6-3.6-2.6-2.5 3.6-.5z" />
    </svg>
  );
}
