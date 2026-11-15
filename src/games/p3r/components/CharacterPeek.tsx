import { characterLabel, characterPhoto, type Character } from '../data/characters';
import styles from '../../p5r/components/PersonaPeek.module.css';
import { L } from '../../../i18n';

/** Nombre de un personaje con su foto al pasar el cursor. */
export function CharacterPeek({ character }: { character: Character }) {
  const photo = characterPhoto(character.id);
  return (
    <span className={styles.peek} tabIndex={0}>
      <span style={{ textDecoration: 'underline dotted', cursor: 'help' }}>{characterLabel(character)}</span>
      <span className={`${styles.preview} ${styles.below}`} aria-hidden="true">
        {photo ? (
          <img className={styles.photoImg} src={photo} alt="" loading="lazy" />
        ) : (
          <span className={`img-stripes ${styles.photo}`}><span>{L('Foto', 'Photo')}</span></span>
        )}
        <span className={styles.previewName}>{character.id === 'protagonist' ? L('Protagonista', 'Protagonist') : character.name}</span>
      </span>
    </span>
  );
}
