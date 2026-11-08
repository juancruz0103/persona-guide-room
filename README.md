# Persona Guide Room

Guía interactiva para **Persona 5 Royal**: calculadora de fusiones de Personas y guía de confidentes, con una estética inspirada en los menús del juego.

> Proyecto fan, no oficial. Persona es propiedad de ATLUS / SEGA.

🔗 **Demo:** https://juancruz0103.github.io/persona-guide-room/

---

## Estado actual

| Etapa | Estado |
|-------|--------|
| 1 · Investigación y planificación | ✅ [Informe](docs/ETAPA-1-informe.md) |
| 2 · Diseño visual navegable | ✅ Versión navegable con datos de muestra |
| 3 · Calculadora (compendio completo + motor de fusiones) | ⏳ Próxima |
| 4 · Guía de confidentes (9 Ladrones Fantasma) | ⏳ |
| 5 · Pruebas y publicación | ⏳ |

**Importante:** hoy el catálogo muestra **14 Personas reales de ejemplo** y la fusión todavía **no calcula resultados** (el motor llega en la Etapa 3). En los confidentes, solo el **rango 2 de Ryuji** tiene datos, y sus textos en español son una traducción provisoria. Todo lo pendiente está marcado así en la web.

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
      ├─ data/          JSON y tablas: Personas, skills, Arcanas, elementos, confidentes
      ├─ services/      Lógica separada de la interfaz (+ tests)
      ├─ components/    Componentes propios de P5R
      └─ pages/         Pantallas
docs/                   Informe y decisiones del proyecto
```

**Sumar un juego:** crear `src/games/<id>/`, registrarlo en `src/core/games.ts` y definir su paleta en `tokens.css` con `[data-game="<id>"]`.

## Fuentes de datos

| Datos | Fuente | Licencia / uso |
|-------|--------|----------------|
| Personas, skills, reglas de fusión | [aqiu384/megaten-fusion-tool](https://github.com/aqiu384/megaten-fusion-tool) (solo archivos de Royal) | Unlicense (dominio público). Se atribuye igual. |
| Respuestas y puntos de confidentes | [RPG Site](https://www.rpgsite.net/feature/5479-persona-5-royal-confidant-guide-conversation-choices-answers-romance-options-gifts-skill-unlocks) | Se usan los datos, redactados con palabras propias. |
| Tabla de Técnicos | [Megami Tensei Wiki](https://megatenwiki.com/wiki/Technical) | Referencia. |

Los íconos de elementos son **diseño propio**. No se usa arte oficial: los recuadros rayados marcan dónde irán las imágenes.

## Roadmap

- **v1:** compendio completo, motor de fusiones con tests, búsqueda inversa, guía de los 9 Ladrones Fantasma.
- **v2:** cuenta de usuario, seguimiento de progreso de confidentes (activable), Personas favoritas.
- **Futuro:** resto de confidentes, imágenes, descripciones de skills, otros idiomas, Persona 3 Reload y Persona 4 Golden con su propia paleta.

## Licencia

Código bajo licencia [MIT](LICENSE). Persona y todo su contenido pertenecen a ATLUS / SEGA.

---

Hecho por **Juan Cruz Vidal**.
