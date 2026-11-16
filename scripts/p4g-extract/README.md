# Datos de Persona 4 Golden (PC)

Todo sale de los archivos del juego, sin tocar la instalación ni las partidas.

1. Con **CriFsLib GUI** extraer:
   - `data_es.cpk` → `P4G-texto-ES` y `data_e.cpk` → `P4G-texto-EN` (textos).
   - De `data.cpk`: `camp/persona/*` (ilustraciones) e `init.bin` / `init_free.bin`.
2. Nombres oficiales y descripciones de habilidades:
   ```
   python3 -I scripts/p4g-extract/extract_text.py <P4G-texto-ES> <P4G-texto-EN> src/games/p4g/data/generated/game-text.json
   ```
3. Datos de fusión (aqiu384/megaten-fusion-tool, dominio público) con los nombres del juego:
   ```
   git clone --depth 1 https://github.com/aqiu384/megaten-fusion-tool /tmp/aqiu
   node scripts/import-p4g/import.mjs /tmp/aqiu/src/app/p4/data $(git -C /tmp/aqiu rev-parse HEAD)
   ```
4. Ilustraciones (`pst_XXX.tmx`, XXX = id del juego en hexadecimal) a WebP:
   ```
   python3 -I scripts/p4g-extract/persona_images.py <camp/persona> src/games/p4g/data/generated/personas.json src/games/p4g/assets/personas
   ```
   Se guarda una imagen por Persona; la otra vista se espeja con CSS.

Notas de formato en `p4g.py` (archivos BIN, PAK, MSG.TBL, BMD y la codificación de tildes).
