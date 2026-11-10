# Etapa 4 · Confidentes

Diseño aprobado en el lienzo (tableros 05, 09 y 10).

## Qué hay

- **Los 23 confidentes** (`data/confidants/index.json`), con filtros Todos / Normales /
  Especiales y por etiqueta: Romance, Solo Royal, Fecha límite, Rango bloqueado, Pedidos de
  Mementos, Pide atributo. El Arcana Mundo no se incluye: es solo para Personas.
- **Especiales con ficha propia:**
  - Automáticos por la historia (Igor, Morgana, Sae): línea de tiempo de rangos con fecha o
    momento y recompensa. Sae suma el recuadro de spoilers del interrogatorio.
  - Pedidos de fusión (Caroline y Justine): Persona y skill que piden en cada rango, armado
    rápido, recompensa y botón a la calculadora. En los rangos sin recompensa, las respuestas
    de la charla no importan.
- **Normales con reglas extra:** aviso arriba de la ficha (Akechi, Maruki, Kasumi, Sojiro,
  Kawakami, Mishima, Yoshida, Chihaya, Oda).
- **Ladrones Fantasma:** chip «Persona: …» con su Persona inicial (foto al pasar el mouse,
  clic a su ficha).
- **Rango 10:** cada confidente muestra la Persona que desbloquea para fusionar.

## Fuentes

- Igor, Morgana y Sae: RPG Site (P5 y Royal coinciden).
- Interrogatorio de Sae: guía de finales de RPG Site. Juan comprobó en el juego que las frases son correctas.
- Pedidos de Caroline y Justine: RPG Site (Royal). Recompensas: GGRecon.
- Fechas límite: las guías dicen 17 o 18/11 para Akechi y Maruki; se muestra la fecha más
  temprana para no arriesgar.

## Pendiente

- **Conversaciones de los 19 confidentes normales.** El texto oficial (español e inglés) está
  en `EVENT_DATA/MESSAGE/E700/E7AA_RR0.BMD` (ver `TEXTOS-DEL-JUEGO.md`); los puntos se toman
  de las guías, emparejados por el texto en inglés de cada opción. Se cargan por tandas.
- Hecho: los 19 confidentes normales y Ladrones Fantasma con conversaciones del juego y puntos de la guía (RPG Site).
  La conversación de "running" de Ryuji es una llamada de Royal (no sobraba).
- Formato de las guías (`scripts/import-confidants/guias/<id>.txt`):
  - `R | opción | puntos [| ROMANCE]`; puntos `?` = recomendada por la guía sin puntos conocidos.
  - `R | TEL | frase EN | frase ES | opción EN | opción ES | puntos [| ROMANCE]` (llamadas, traducción provisoria).
  - `R | DESBLOQUEO | nombre | descripción`, `R | NOIMPORTA`, `CONSEJO | texto`.
- Rango 9 con romance: `ROUTES` en import.mjs marca las elecciones que solo aparecen en la ruta romántica
  o en la de amistad (revisado en los BMD). Kawakami decide el romance en tres preguntas seguidas.
- Rangos «sin datos»: el juego tiene elecciones pero la guía no da puntos. Hoy: rango 1 de Makoto,
  Futaba, Haru, Sojiro, Chihaya, Iwai, Takemi, Kawakami, Ohya, Hifumi y Yoshida; rangos 1 y 5 de Oda.
- Pendiente: llamadas sin frase en la guía (Haru, Akechi 7, Futaba 9, Ohya 9, Oda, Iwai 5, Takemi 9,
  Kawakami 9, Chihaya 9, Hifumi 9, Makoto 9); los rangos sin datos; nombres oficiales de las habilidades.
- Nombres oficiales en español de las habilidades de confidente.
- Requisitos de atributo con número (hoy las guías no coinciden).

## Requisitos, misiones y recompensas (9/11)

- `R | REQUISITO | texto` se muestra arriba del rango («Requisito para este rango»).
- `R | MEMENTOS | título | descripción | [archivo]` pone un aviso de misión entre las conversaciones
  (después de la última conversación de ese archivo del juego, o al final). La descripción es la oficial
  de `datQuestHelp` (quest51 a quest60); el título queda en inglés porque no está en los archivos extraídos.
- `R | SINRECOMPENSA` muestra «Este rango no da ninguna recompensa».
- Comprobado en la partida (10/11):
  - El Baton Pass viene de entrada en Royal: ningún confidente lo da.
  - Nombres oficiales de las habilidades sacados de la pantalla de cada confidente (capturas de Juan).
  - Ann: Seducción en el rango 4; el 7 no da nada. Ryuji: Esprint sigiloso en el 4.
  - Maruki: Potenc. de flujo (7) e Insomnio (10). Akechi: 3 y 6 no dan nada; Golpe de abanico en el 7.
  - Títulos de las misiones de Mementos en español. Oda rango 5 (notas musicales).
  - Ohya y Chihaya: rangos de la Megami Tensei Wiki, que coinciden con el orden de la pantalla del juego.
- Akechi: los rangos 1, 3, 5, 6, 8 y 9 no dan nada; Mediación zalamera, Golpe de gracia, Protección y Último aliento
  los obtiene más adelante (el consejo no dice cuándo: spoiler). Sin detalles de los rangos 9 y 10 (spoilers fuertes).
- Falta: Ann, ¿tiene requisito de atributo?
