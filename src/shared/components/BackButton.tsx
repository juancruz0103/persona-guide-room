import { useNavigate } from 'react-router-dom';

/**
 * «← Volver»: vuelve a la página anterior en el mismo lugar donde estabas.
 * Si se entró directo (sin página anterior), lleva a la página indicada.
 */
export function BackButton({ fallback, label = 'Volver', className }: { fallback: string; label?: string; className?: string }) {
  const navigate = useNavigate();
  const canGoBack = ((window.history.state as { idx?: number } | null)?.idx ?? 0) > 0;
  return (
    <button
      type="button"
      className={className ?? 'label back-btn'}
      onClick={() => (canGoBack ? navigate(-1) : navigate(fallback))}
    >
      ← {label}
    </button>
  );
}
