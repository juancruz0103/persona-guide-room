# Persona 3 Reload · Etapa 1: investigación y plan

> Rama de trabajo: `p3r`. Nada de esto se publica en el sitio hasta terminar.
> Fuera de alcance: todo el contenido de **Episode Aigis** (DLC que no tenemos).

## Paleta elegida: "Medianoche"

| Rol | Color | Equivalente en Royal |
|-----|-------|----------------------|
| Fondo | `#111827` | negro `#0B0B0B` |
| Principal | `#00AEEF` | rojo |
| Texto y detalles | `#FFFFFF` | blanco hueso |

Misma estructura y componentes que Royal; solo cambia la paleta con `[data-game="p3r"]`.

## 1. Calculadora de Personas

**Fuente base:** [aqiu384/megaten-fusion-tool](https://github.com/aqiu384/megaten-fusion-tool), carpeta `src/app/p3r/data` (Unlicense, la misma que usamos en Royal).

- `demon-data.json`: **194 Personas**, con nivel, Arcana, stats, afinidades, habilidades y el **objeto de corazón** (heart item) que dan al subir de nivel.
- `party-data.json`: 9 Personas de los compañeros de S.E.E.S.
- `skill-data.json`: 602 habilidades.
- `fusion-chart.json` y `special-recipes.json`: tabla de fusión y **22 fusiones especiales** (de 2 a 6 ingredientes).
- `demon-unlocks.json`: Personas que se desbloquean por historia, peticiones de Elizabeth, vínculo al máximo o DLC.
- Episode Aigis está en archivos **separados** (`aeg-*.json`): no se importan.

**Diferencias con Royal que cambian la calculadora:**
- 10 afinidades: Cortante, Contundente, Perforante, Fuego, Hielo, Eléctrico, Viento, Luz, Oscuridad y Todopoderoso.
- No hay silla eléctrica: el objeto de corazón reemplaza a los items de Royal, y las skill cards se consiguen de otra forma.
- DLC de Personas (sets de P4 y P5): se marcan y se pueden ocultar con un filtro, igual que en Royal.

## 2. Vínculos sociales

- **22 vínculos**, uno por Arcana. Algunos avanzan solos con la historia (Loco, Muerte, Juicio y otros).
- Las respuestas con puntos están verificadas para la versión Reload en [RPG Site](https://www.rpgsite.net/guide/15321-persona-3-reload-100-max-social-link-guide) (los puntos difieren de Portable y FES).
- **Mecánicas propias de P3** a cubrir en la guía: requisitos de stats sociales para empezar, días y lugares fijos, Persona de la misma Arcana para ganar más puntos, rutas de romance y amistad, y vínculos que se pueden **invertir o romper**.
- **Linked Episodes:** episodios con los compañeros varones de S.E.E.S. (nuevo en Reload). Se evalúan después.

## 3. Respuestas de clase

- Preguntas de clase y **cuatro tandas de exámenes** (mayo, julio, octubre y diciembre). Las respuestas son distintas a las de Portable y FES.
- Hay guías en español con el texto oficial de la traducción, como [En Cancha](https://www.encancha.cl/tecno-game/juegos/2024/02/02/persona-3-reload-revisa-las-respuestas-a-todos-los-test-y-examenes/).

## 4. Archivos del juego (texto oficial en español)

- La instalación está en `E:\Xbox\Persona 3 Reload` (versión Xbox / PC Game Pass). **Solo lectura**: no se modifica nada ni se tocan las partidas guardadas.
- El juego usa **Unreal Engine 4.27** con IoStore (`.pak`, `.utoc` y `.ucas` de varios GB). Son demasiado grandes para copiarlos, así que la lectura se hace **en tu PC con FModel**.
- FModel necesita la clave AES del juego, que publica la comunidad de modding en la [documentación de Persona Modding](https://animatedswine37.github.io/persona-modding-docs/docs/getting-started/extracting-files).
- Qué buscamos exportar:
  1. Tablas de nombres en español (Personas, habilidades, objetos y Arcanas) para usar los nombres oficiales.
  2. Mensajes (`.bmd`) de los vínculos, para el texto oficial de cada pregunta y respuesta.
  3. Preguntas y respuestas de clase y exámenes.
- Se exportan a una carpeta del escritorio (por ejemplo `C:\Users\User\Desktop\P3R-datos`) y desde ahí los leo.

## Plan por etapas

| Etapa | Contenido |
|-------|-----------|
| 1 | Investigación y plan (este documento) ✅ |
| 2 | Paleta P3R, registro del juego y portada |
| 3 | Calculadora: compendio, motor de fusiones, fichas y búsqueda inversa |
| 4 | Extracción con FModel: nombres y textos oficiales en español |
| 5 | Vínculos sociales: los 22, con respuestas, puntos y desbloqueos |
| 6 | Respuestas de clase y exámenes |
| 7 | Builds de Personas (al final, adaptadas a las mecánicas de P3R) |
| 8 | Pruebas completas y publicación |
