# Textos oficiales del juego

Los nombres y descripciones que muestra la web (Personas, skills, rasgos, Arcanas,
accesorios, armas, armaduras y skill cards) son los **oficiales de P5R**, en español de
España y en inglés. Se leen de los archivos de texto de una copia del juego en PC.

## Cómo se consiguen (sin tocar el juego ni las partidas)

1. Con **CriFsLib.GUI** (Sewer56/CriFsV2Lib, releases) se abre el paquete de idioma y se usa
   *Extract All* hacia una carpeta fuera del juego. El extractor solo lee el `.cpk`.
   - Español: `P5R/CPK/ES.CPK`.
   - Inglés: `EN.CPK`. Steam lo descarga solo con el juego en inglés
     (Propiedades → Idioma). `BASE.CPK` trae el texto en **japonés**, no en inglés.
2. Se corre el script:

```bash
node scripts/import-game-text/import.mjs <carpeta ES> <carpeta EN> <megaten-fusion-tool>/src/app/p5/data
```

Genera `src/games/p5r/data/generated/game-text.json`. **Los archivos del juego no se suben al
repositorio**, solo ese resultado.

## Qué archivos se leen

| Archivo | Contenido |
|---------|-----------|
| `BATTLE/TABLE.PAC` → `NAME.TBL` | Todos los nombres, en secciones (skills, Personas, rasgos, accesorios, armaduras, armas…) en el mismo orden en todos los idiomas |
| `INIT/DATMSG.PAK` → `dat*Help.bmd` | Descripciones de skills, accesorios, armas, armaduras y skill cards |

Detalles técnicos (resueltos en el script): el texto usa una codificación propia de Atlus
(los caracteres no ASCII ocupan 2 bytes); las skills se emparejan por su número interno
(el de aqiu384); Personas e items por su nombre en inglés, con una lista corta de alias
para las diferencias de escritura (por ejemplo "Koropokkuru" / "Koropokguru").

## Resultado

- Skills: 385/385 · Personas: 232/232 · Items: 420/422 · Arcanas: 24/24.
- Las búsquedas encuentran por nombre en español o en inglés.
- En la ficha de cada Persona se muestra también su nombre en inglés.

## Próximo

Los mismos paquetes de idioma traen los diálogos de los confidentes (`EVENT_DATA/MESSAGE`),
con sus opciones de respuesta. Falta ubicar el archivo de cada rango.
