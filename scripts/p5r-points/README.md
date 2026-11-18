# Puntos de los confidentes de Royal, desde el juego

En los mensajes de los eventos de confidentes (`ES.CPK` → `EVENT_DATA/MESSAGE/E700/E7AA_RRx.BMD`) la respuesta que
suma puntos lleva la función `F4 AD [arcana+1, 01, código, 01, …]`. El código es 6, 11 o 16 = 1, 2 o 3 notas.
Llevar una Persona del Arcana del confidente suma una nota más (máximo 3); la web muestra los puntos con esa nota.

- `verify.py <E700> <data/confidants>`: compara los puntos de la guía con los del juego.
- `apply.py <E700> <data/confidants>`: corrige los puntos. Para cada elección toma los códigos de las respuestas
  hasta la elección siguiente: si hay uno por opción, los asigna en orden; si hay tantos como opciones con puntos en
  la guía, los asigna a esas; si no hay ninguno, ninguna opción suma; si hay un solo valor compartido (varias opciones
  llevan a la misma respuesta), vale para todas las que la guía marcaba. Los casos con varias respuestas por opción
  están revisados a mano mirando los mensajes (`MANUAL` en `apply.py`).

Los scripts `.BF` de `EVENT_DATA/SCRIPT/E700` solo guardan qué opción se eligió (flags 752–767); los puntos no están ahí.
