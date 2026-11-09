# Función: Personas de compañeros, origen e idioma

Diseño aprobado en el lienzo (tableros 02 Catálogo y 03 Ficha).

## Personas de los compañeros

- 27 Personas: la inicial, la evolucionada y la del tercer semestre de Ryuji, Ann, Morgana,
  Yusuke, Makoto, Futaba, Haru, Akechi y Kasumi. Las de Joker (Arsène, Satanael, Raoul) ya
  estaban porque se pueden fusionar.
- Tienen ficha completa (afinidades, skills, rasgo, origen) pero **no entran en la
  calculadora de fusión**. La ficha avisa de quién son y enlaza a su confidente.
- Catálogo: filtro «Personas de compañeros». «Iniciales» se ve siempre; «Evolucionadas» y
  «Tercer semestre» aparecen detrás de «Más filtros · contiene spoilers».
- La imagen de las evolucionadas y del tercer semestre va tapada; se muestra al tocarla.

### De dónde salen los datos

`scripts/import-aqiu384` lee `roy-party-data.json` (solo trae la Persona inicial) y arma las
otras formas con los códigos de nivel de skill de la fuente:

| Código | Significado |
|--------|-------------|
| `C1`…`C9` | Se aprende en ese rango del confidente (Futaba) |
| `Cx` | Rango 10: evoluciona, gana esa skill y cambian sus afinidades (`sesists`) |
| `Cy` | Tercer semestre: gana esa skill y un rasgo nuevo |

Akechi es distinto: Loki viene como entrada propia y Hereward sale de Loki.
Resultado en `src/games/p5r/data/generated/party.json`.

## Origen

Cada ficha muestra el texto de mitología del compendio del juego (`datMyth.bmd`, en
`INIT/DATMSG.PAK`), en español oficial. Las 259 Personas lo tienen.

## Idioma

Botón con globo en el header. Por ahora solo Español; English aparece como «Próximamente».

## Sin nombre oficial

`Mementos Scan` y `Treasure Reboot` (navegación de Futaba) no figuran con ese nombre en la
tabla del juego: quedan en inglés.
