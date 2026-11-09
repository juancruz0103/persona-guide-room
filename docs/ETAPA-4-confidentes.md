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
- Interrogatorio de Sae: guía de finales de RPG Site. Frases traducidas de la guía; falta
  reemplazarlas por el texto oficial del juego.
- Pedidos de Caroline y Justine: RPG Site (Royal). Recompensas: GGRecon.
- Fechas límite: las guías dicen 17 o 18/11 para Akechi y Maruki; se muestra la fecha más
  temprana para no arriesgar.

## Pendiente

- **Conversaciones de los 19 confidentes normales.** El texto oficial (español e inglés) está
  en `EVENT_DATA/MESSAGE/E700/E7AA_RR0.BMD` (ver `TEXTOS-DEL-JUEGO.md`); los puntos se toman
  de las guías, emparejados por el texto en inglés de cada opción. Se cargan por tandas.
- Hecho: los 8 Ladrones Fantasma con conversaciones del juego y puntos de la guía. La conversación de "running" de Ryuji es una llamada de Royal (no sobraba).
- Pendiente: llamadas de Haru (la guía no trae la frase de Haru) y la de Akechi en el rango 7.
- Nombres oficiales en español de las habilidades de confidente.
- Requisitos de atributo con número (hoy las guías no coinciden).
