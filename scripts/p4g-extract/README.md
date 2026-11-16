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

## Vínculos sociales

Los diálogos de cada vínculo están en `event/eXX0/*.PM1` (un evento por rango: `E610_020` = Naoto, rango 2).
Cada PM1 trae un BMD con los mensajes y las opciones (`pm1.py`). Las carpetas `eXX5` son la otra ruta del rango 10
(amistad; en Ayane, `E715` es el romance). Los puntos no están en estos archivos: salen de la guía de RPG Site
(`links-guide-points.txt`) y se cruzan por texto.

```
python3 extract_links.py <P4G-texto-ES> <P4G-texto-EN> [<event extra EN>] /tmp/p4g-links-dialogs.json
python3 merge_links.py /tmp/p4g-links-dialogs.json <repo>
```

El vínculo de Teddie (Estrella) sube solo: sus eventos no tienen opciones.

Fotos de los vínculos: los retratos del menú de vínculos están en `commu/bustup/com_kyaraXX_a(_w).tmx`
(02 Yosuke … 08 Teddie, 10 Dojima, 11 Sayoko, 12 Zorro, 13 Kou, 14 Daisuke, 15 Naoki, 16 Hisano, 18 Ai, 19 Shu,
1a Yumi, 1b Ayane, 1c Eri, 1d Nanako, 1e Margaret, 1f Adachi, 20 Marie; 21 es un spoiler con placeholder: no se usa).
El protagonista (Loco) sale de `camp/bustup/c_cha01a.tmx`. Antes se usaba `camp/bustup/c_chaNNa.tmx` (01 protagonista, 02 Yosuke, 03 Chie, 04 Yukiko, 05 Rise,
06 Kanji, 07 Naoto, 08 Teddie; `b` = ropa de verano) → `src/games/p4g/assets/links/<id>.webp`.

## Clases y exámenes

Las preguntas están en `event/e470` (E470/E471/E473 = clases, E474 = exámenes). Las fechas y las respuestas
salen de la guía de RPG Site (`classes-guide.txt`) y se cruzan por la respuesta y el texto de la pregunta.

```
python3 extract_classes.py <P4G-texto-ES> <P4G-texto-EN> src/games/p4g/data/generated/classes.json
```

El nombre del protagonista va en el texto como la función `F1 82`; se guarda como `{P}` y la web pone "Yu".
