# Datos de Persona 5 Strikers

`build.py <aqiu384 src/app/p5s/data> <raíz del repo>` arma `src/games/p5s/data/generated/`.

- Fuente: [aqiu384/megaten-fusion-tool](https://github.com/aqiu384/megaten-fusion-tool) (dominio público).
- Los nombres en español de Personas y habilidades salen del texto oficial de Royal (`src/games/p5r/data/generated/game-text.json`).
  Las habilidades de resistencia que no existen en Royal (Resistir fuego, Absorber electricidad…) se arman con el mismo patrón oficial (`derivedName`).
- Los archivos del juego (motor de Koei Tecmo) no tienen nombres y `LINKDATA.BIN` está cifrado, así que por ahora no se pueden usar como fuente.
- Fusión: recetas fijas por Persona (confirmado en el Velvet Room). Reglas en `src/games/p5s/fusion/engine.ts`;
  casos vistos en el juego en `fusion/check.test.ts`. Los «Treasure» de la fuente son enemigos y no se incluyen.
