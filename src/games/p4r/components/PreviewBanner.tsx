import { L } from '../../../i18n';

/**
 * Aviso de la vista previa: hasta que salga el juego (18/2/2027) los datos son los de Golden.
 * Se borra el día del lanzamiento, cuando se importan los datos de Revival (ver scripts/p4r/README.md).
 */
export function PreviewBanner() {
  return (
    <div role="note" style={{ background: '#1b1b1b', color: '#ffe600', padding: '10px 0', fontFamily: 'var(--f-label)', fontWeight: 700, letterSpacing: '0.04em' }}>
      <div className="container">
        {L(
          'VISTA PREVIA · No publicada. Datos provisorios de Persona 4 Golden hasta que salga Revival (18 de febrero de 2027).',
          'PREVIEW · Not published. Placeholder Persona 4 Golden data until Revival launches (February 18, 2027).',
        )}
      </div>
    </div>
  );
}
