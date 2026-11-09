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

## Confidentes: dónde están los diálogos

Ubicados en los mismos paquetes de idioma (español e inglés, mismas claves en los dos):

| Archivo | Contenido |
|---------|-----------|
| `EVENT_DATA/MESSAGE/E700/E7AA_RR0.BMD` | Conversación de rango. `AA` = número de Arcana, `RR` = rango. Ej.: `E707_020` = Carro (Ryuji), rango 2. Las opciones son los mensajes `SEL_*` |
| `E7AA_2xx.BMD` | Eventos extra de Royal (tercer semestre) |
| `FIELD/NPC/CORPAAA.BF` | Diálogos de invitación ("¿Salimos?", ir al Palacio, estudiar) |
| `EVENT_DATA/MESSAGE/E800/E8AA_xxx.BMD` | Citas/quedadas en lugares de la ciudad |

Ryuji completo (rangos 2 a 10) verificado: cada archivo tiene las opciones esperadas.

**Lo que los archivos NO resuelven todavía:** los **puntos** de cada respuesta no están en el
texto ni en el script del evento (`EVENT_DATA/SCRIPT/E700/E7AA_RR0.BF` solo sube el rango).
Siguen viniendo de guías (RPG Site), emparejados por el texto en inglés de la opción.

**Llamadas de Royal:** las llamadas y mensajes de los confidentes (por ejemplo, la de Ryuji en el
rango 2, "I should've kept up my running") **no están** en los eventos E700. Vienen de la guía en
inglés con una traducción provisoria, marcada así en la página.

**Cómo se cargan:** `scripts/import-confidants/extract.py` saca las elecciones de E700 (ES y EN);
`scripts/import-confidants/guias/<id>.txt` tiene los puntos de la guía; `import.mjs` los cruza y
avisa si una opción de la guía no existe en el juego.
