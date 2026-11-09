# Función: Skill Cards y silla eléctrica

Diseño aprobado en el lienzo (tableros **SkillCards** y **Ficha**) antes de programarlo.

## Qué hace

**Pestaña "Skill cards" de la calculadora** (`#/p5r/calculadora/skill-cards`)
- Lista las 358 skills del juego (sin contar los rasgos).
- Para cada una: qué Persona da su skill card en la silla eléctrica (blanco = ejecución normal,
  rojo = con Alarma de fusión), o la marca **Exclusiva** si no existe como skill card.
- Columna "La aprenden": Personas que la aprenden por nivel. Cada nombre lleva a su ficha y,
  al pasar el mouse, muestra la foto (por ahora el recuadro rayado) y el nivel.
- Filtros: búsqueda por skill o Persona, tipo (Todas / Con skill card / Con alarma / Exclusivas)
  y elemento con los íconos aprobados.
- Recuadro al pasar el mouse por el ícono: elemento, **costo** (HP en verde, SP en violeta),
  estado que causa y con qué se hace Técnico.

**Ficha de cada Persona: sección "Silla eléctrica"**
- Item normal y item con Alarma de fusión, con su ícono (arma de cada ladrón, arma de fuego,
  armadura según para quién, accesorio, skill card).
- Al pasar el mouse por el ícono: tipo y qué hace. Accesorio o skill card → la skill que da y su
  costo. Arma o armadura → estadísticas y efectos.

## Fuentes

| Dato | Fuente | Licencia |
|------|--------|----------|
| Item normal (`item`) y con alarma (`itemr`) de cada Persona | aqiu384/megaten-fusion-tool | Unlicense |
| Accesorio → skill que enseña | aqiu384, `roy-accessories.json` | Unlicense |
| Skill exclusiva (rango > 89 o 0) | aqiu384 | Unlicense |
| Tipo, personaje y estadísticas de armas y armaduras | quan/persona5-items | MIT |

Que `itemr` es el item con Alarma de fusión está confirmado por RPG Site.

## Limitaciones conocidas (no se inventan datos)

- **Estadísticas de armas y armaduras** salen de P5 original: en la web llevan la nota
  "pueden variar en Royal".
- **Versiones de Royal** (nombres con R, EX o II): se sabe el tipo, faltan los números.
- **42 items nuevos de Royal** sin tipo ni estadísticas: se muestran con un ícono de pregunta.
- Todo lo pendiente está en [`REVISAR-items.md`](REVISAR-items.md) para comprobarlo en el juego.
- **Nombres y descripciones** son los oficiales del juego (ver
  [`TEXTOS-DEL-JUEGO.md`](TEXTOS-DEL-JUEGO.md)). Los efectos de armas y armaduras que vienen de
  quan/persona5-items siguen con redacción propia.
- **Emperor's Amulet** (accesorio) no aparece con ese nombre en la tabla del juego: queda en inglés.

## Cómo regenerar los datos

```bash
node scripts/import-aqiu384/import.mjs <ruta a megaten-fusion-tool>/src/app/p5/data <commit>
git clone --depth 1 https://github.com/quan/persona5-items /tmp/p5items
node scripts/import-items/import.mjs /tmp/p5items/src/data/itemizations.data.json
```

## Código

- `services/items.ts`: items, descripciones, índice de skill cards y filtros (con tests).
- `services/skillText.ts`: costo, elemento/objetivo y Técnico de una skill (compartido).
- `components/SkillTip.tsx`: ícono de skill con su recuadro (ficha y skill cards).
- `components/ItemIcon.tsx`, `components/ElectricChair.tsx`, `pages/SkillCards.tsx`.
