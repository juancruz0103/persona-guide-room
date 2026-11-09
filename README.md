# Persona Guide Room

Guía interactiva para **Persona 5 Royal**: calculadora de fusiones de Personas y guía de confidentes, con una estética inspirada en los menús del juego.

> Proyecto fan, no oficial. Persona es propiedad de ATLUS / SEGA.

🔗 **Demo:** https://juancruz0103.github.io/persona-guide-room/

---

## Estado actual

| Etapa | Estado |
|-------|--------|
| 1 · Investigación y planificación | ✅ [Informe](docs/ETAPA-1-informe.md) |
| 2 · Diseño visual navegable | ✅ [Decisiones de diseño](docs/ETAPA-2-diseno.md) |
| 3 · Calculadora (compendio completo + motor de fusiones) | ✅ [Reglas y verificación](docs/ETAPA-3-fusiones.md) |
| 4 · Guía de confidentes (9 Ladrones Fantasma) | ⏳ Próxima |
| 5 · Pruebas y publicación | ⏳ |

**Hoy:** la calculadora tiene las **232 Personas** de Royal, fusión de 2 Personas, búsqueda inversa y recetas especiales, con opciones para excluir DLC y Treasure Demons. **Respuestas de clase:** las 100 preguntas de profesores y exámenes, filtrables por mes, día y tipo. En los confidentes, solo el **rango 2 de Ryuji** tiene datos (traducción provisoria). Todo lo pendiente está marcado así en la web.

## Tecnologías

- **React 18 + TypeScript**: interfaz por componentes, tipada.
- **Vite**: servidor de desarrollo y build rápidos.
- **React Router (HashRouter)**: rutas compatibles con GitHub Pages.
- **CSS Modules + variables CSS**: estilos por componente y paleta centralizada (permite cambiar la paleta por juego).
- **Vitest**: tests de la lógica (filtros, datos, confidentes).
- **GitHub Actions + GitHub Pages**: publicación automática.

Sitio 100% estático: no hay backend ni claves.

## Cómo ejecutarlo

Requisitos: [Node.js](https://nodejs.org/) 20 o superior.

```bash
npm install       # instala dependencias (solo la primera vez)
npm run dev       # abre la web en modo desarrollo
npm test          # corre los tests
npm run build     # genera la versión final en /dist
npm run preview   # sirve la versión final localmente
```

**Actualizar los datos de Personas:**

```bash
git clone --depth 1 https://github.com/aqiu384/megaten-fusion-tool /tmp/aqiu
node scripts/import-aqiu384/import.mjs /tmp/aqiu/src/app/p5/data $(git -C /tmp/aqiu rev-parse HEAD)
npm test
```

## Organización de carpetas

```
src/
├─ app/                 Router, layout por juego, 404
├─ core/                Tipos compartidos y registro de juegos
├─ i18n/                Textos de la interfaz (es)
├─ shared/
│  ├─ components/       Header, menú de juegos, íconos, marcadores de imagen...
│  └─ styles/           tokens.css (paleta por juego) y estilos globales
└─ games/
   └─ p5r/              Todo lo de Persona 5 Royal
      ├─ data/          Tablas propias + generated/ (datos importados) + confidentes
      ├─ fusion/        Motor de fusiones (TypeScript puro + tests)
      ├─ services/      Lógica separada de la interfaz (+ tests)
      ├─ components/    Componentes propios de P5R
      └─ pages/         Pantallas
scripts/                Importador de datos
docs/                   Informe y decisiones del proyecto
```

**Sumar un juego:** crear `src/games/<id>/`, registrarlo en `src/core/games.ts` y definir su paleta en `tokens.css` con `[data-game="<id>"]`.

## Fuentes de datos

| Datos | Fuente | Licencia / uso |
|-------|--------|----------------|
| Personas, skills, reglas de fusión | [aqiu384/megaten-fusion-tool](https://github.com/aqiu384/megaten-fusion-tool) (solo archivos de Royal) | Unlicense (dominio público). Se atribuye igual. |
| Respuestas y puntos de confidentes | [RPG Site](https://www.rpgsite.net/feature/5479-persona-5-royal-confidant-guide-conversation-choices-answers-romance-options-gifts-skill-unlocks) | Se usan los datos, redactados con palabras propias. |
| Tabla de Técnicos | [Megami Tensei Wiki](https://megatenwiki.com/wiki/Technical) | Referencia. |
| Respuestas de clase y exámenes | [Eurogamer España](https://www.eurogamer.es/persona-5-royal-todas-respuestas-examenes-preguntas-clase) (verificadas jugando) · temas redactados a partir de [RPG Site](https://www.rpgsite.net/feature/9602-persona-5-royal-school-answers-all-class-test-questions-solutions) | Se usan las respuestas; los temas están redactados con palabras propias. |

Los íconos de elementos son **diseño propio**. No se usa arte oficial: los recuadros rayados marcan dónde irán las imágenes.

## Roadmap

- **v1:** ~~compendio completo, motor de fusiones, búsqueda inversa~~ ✅ · guía de los 9 Ladrones Fantasma.
- **v2:** cuenta de usuario, seguimiento de progreso de confidentes (activable), Personas favoritas.
- **Futuro:** resto de confidentes, imágenes, descripciones de skills, otros idiomas, Persona 3 Reload y Persona 4 Golden con su propia paleta.

## Licencia

Código bajo licencia [MIT](LICENSE). Persona y todo su contenido pertenecen a ATLUS / SEGA.

---

Hecho por **Juan Cruz Vidal**.
