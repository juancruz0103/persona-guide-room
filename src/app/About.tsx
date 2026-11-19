import styles from './About.module.css';
import { L } from '../i18n';
import { useGameBase } from '../shared/hooks/useGameBase';

const MAIL = 'personaguyconsultas@gmail.com';

/** Sobre nosotros: qué es el proyecto, contacto y donaciones. */
export default function About() {
  const p3r = useGameBase() === '/p3r';
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroSlab} aria-hidden="true" />
        <div className={`container ${styles.heroInner}`}>
          <span className={styles.kicker}>Persona Guide Room</span>
          <h1 className={styles.title}>{L('Sobre nosotros', 'About us')}</h1>
          <p className={styles.lead}>
            {p3r
              ? L(
                  'Persona Guide Room es un proyecto personal hecho por un fan de la saga Persona. La idea es tener en un solo lugar todo lo que hace falta para jugar tranquilo: los vínculos con sus respuestas, las clases, el compendio de Personas y la calculadora de fusiones, siempre cuidando los spoilers.',
                  'Persona Guide Room is a personal project made by a fan of the Persona series. The idea is to have everything you need to play at ease in one place: Social Links with their answers, classes, the Persona compendium and the fusion calculator, always avoiding spoilers.',
                )
              : L(
                  'Persona Guide Room es un proyecto personal hecho por un fan de la saga Persona. La idea es tener en un solo lugar todo lo que hace falta para jugar tranquilo: los confidentes con sus respuestas, el compendio de Personas y la calculadora de fusiones, siempre cuidando los spoilers.',
                  'Persona Guide Room is a personal project made by a fan of the Persona series. The idea is to have everything you need to play at ease in one place: confidants with their answers, the Persona compendium and the fusion calculator, always avoiding spoilers.',
                )}
          </p>
        </div>
      </section>

      <section className={`container ${styles.cards}`}>
        <article className={`${styles.card} ${styles.wide}`}>
          <h2 className={styles.cardTitle}>{L('Quién está detrás', 'Who is behind it')}</h2>
          <p>
            {L('Soy', "I'm")} <strong>Juan</strong>
            {L(
              ', fan de la saga Persona. La guía empezó con Persona 5 Royal y hoy también tiene Persona 4 Golden, Persona 3 Reload y Persona 5 Strikers: los diálogos y las respuestas salen de los textos oficiales de cada juego y los voy comprobando mientras juego.',
              ", a fan of the Persona series. The guide started with Persona 5 Royal and now also covers Persona 4 Golden, Persona 3 Reload and Persona 5 Strikers: dialogue and answers come from each game's official text and I check them as I play.",
            )}
          </p>
          <a className={styles.mail} href="https://github.com/juancruz0103/persona-guide-room" target="_blank" rel="noopener noreferrer">
            {L('Ver el proyecto en GitHub →', 'See the project on GitHub →')}
          </a>
        </article>

        <article className={styles.card}>
          <h2 className={styles.cardTitle}>{L('¿Dudas o errores?', 'Questions or mistakes?')}</h2>
          <p>{L('Si encontrás algo mal o tenés una consulta, escribinos y lo revisamos.', 'If you find something wrong or have a question, write to us and we will check it.')}</p>
          <a className={styles.mail} href={`mailto:${MAIL}`}>{MAIL}</a>
        </article>

        <article className={styles.card}>
          <h2 className={styles.cardTitle}>{L('Apoyá el proyecto', 'Support the project')}</h2>
          <p>{L('Si la guía te sirvió, podés invitarme un café. Ayuda a mantenerla al día y a sumar cosas nuevas.', 'If the guide helped you, you can buy me a coffee. It helps keep it up to date and add new things.')}</p>
          <div className={styles.buttons}>
            <a className="btn btn--light" href="https://cafecito.app/personaguy" target="_blank" rel="noopener noreferrer">
              Cafecito (Argentina)
            </a>
            <a className="btn btn--accent" href="https://ko-fi.com/personaguy" target="_blank" rel="noopener noreferrer">
              {L('Ko-fi (internacional)', 'Ko-fi (international)')}
            </a>
          </div>
        </article>
      </section>
    </>
  );
}
