import styles from './About.module.css';

const MAIL = 'personaguyconsultas@gmail.com';

/** Sobre nosotros: qué es el proyecto, contacto y donaciones. */
export default function About() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroSlab} aria-hidden="true" />
        <div className={`container ${styles.heroInner}`}>
          <span className={styles.kicker}>Persona Guide Room</span>
          <h1 className={styles.title}>Sobre nosotros</h1>
          <p className={styles.lead}>
            Persona Guide Room es un proyecto personal hecho por un fan de la saga Persona. La idea es tener en un solo
            lugar todo lo que hace falta para jugar tranquilo: los confidentes con sus respuestas, el compendio de
            Personas y la calculadora de fusiones, siempre cuidando los spoilers.
          </p>
        </div>
      </section>

      <section className={`container ${styles.cards}`}>
        <article className={`${styles.card} ${styles.wide}`}>
          <h2 className={styles.cardTitle}>Quién está detrás</h2>
          <p>
            Soy <strong>Juan Cruz Vidal</strong>, fan de la saga Persona. Armé esta guía
            mientras jugaba Persona 5 Royal: cada respuesta, llamada y foto la fui comprobando en el juego.
          </p>
          <a className={styles.mail} href="https://github.com/juancruz0103/persona-guide-room" target="_blank" rel="noopener noreferrer">
            Ver el proyecto en GitHub →
          </a>
        </article>

        <article className={styles.card}>
          <h2 className={styles.cardTitle}>¿Dudas o errores?</h2>
          <p>Si encontrás algo mal o tenés una consulta, escribinos y lo revisamos.</p>
          <a className={styles.mail} href={`mailto:${MAIL}`}>{MAIL}</a>
        </article>

        <article className={styles.card}>
          <h2 className={styles.cardTitle}>Apoyá el proyecto</h2>
          <p>Si la guía te sirvió, podés invitarme un café. Ayuda a mantenerla al día y a sumar cosas nuevas.</p>
          <div className={styles.buttons}>
            <a className="btn btn--light" href="https://cafecito.app/personaguy" target="_blank" rel="noopener noreferrer">
              Cafecito (Argentina)
            </a>
            <a className="btn btn--accent" href="https://ko-fi.com/personaguy" target="_blank" rel="noopener noreferrer">
              Ko-fi (internacional)
            </a>
          </div>
        </article>
      </section>
    </>
  );
}
