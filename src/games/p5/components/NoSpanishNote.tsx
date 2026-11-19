import { isEn } from '../../../i18n';

/** P5 original no salió en español: se avisa que los nombres son los oficiales de Royal. */
export function NoSpanishNote() {
  if (isEn()) return null;
  return (
    <p className="container" style={{ marginTop: 16, color: 'var(--c-text-muted)', fontSize: 15 }}>
      Persona 5 original no tiene traducción oficial al español. Los nombres y textos en español son los oficiales de
      Persona 5 Royal.
    </p>
  );
}
