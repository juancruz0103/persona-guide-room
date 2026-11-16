# Persona Guide Room

Guía interactiva para **Persona 5 Royal** y **Persona 3 Reload**: calculadoras de fusiones, guías de confidentes y vínculos, respuestas de clase y builds de Personas creadas por la comunidad. Cada juego tiene una estética inspirada en sus menús.

> Proyecto fan, no oficial. Persona es propiedad de ATLUS / SEGA.

🔗 **Sitio:** https://personaguy.personaguide.workers.dev/

---

## Qué tiene

- **Calculadora de fusiones:** las **232 Personas** de Royal, con fusión de 2 Personas, búsqueda inversa, fusiones especiales y avanzadas, y opciones para excluir DLC y Treasure Demons.
- **Fichas de Personas:** estadísticas, afinidades, habilidades, rasgo, skill card y objeto de la silla eléctrica.
- **Skill cards:** qué Persona da cada skill card, normal o con Alarma de fusión.
- **Confidentes:** los **23 confidentes**, con las mejores respuestas por rango, rutas de romance, fechas límite, rangos bloqueados y recompensas.
- **Respuestas de clase:** las 100 preguntas de profesores y exámenes, filtrables por mes, día y tipo.
- **Builds:** rutas de fusión paso a paso con fotos, herencia de habilidades y rasgos, skill cards, notas por paso y un panel automático de requisitos (confidentes al máximo, DLC y avance de la historia, con aviso de spoiler).
  - Editor guiado que verifica cada combinación con el motor de fusiones.
  - Comentarios, "me gusta" y reportes.
- **Cuentas de usuario:** entrada con Google (la cuenta se crea sola la primera vez).
  - Progreso de confidentes guardado en la cuenta, con orden configurable en «Mi perfil».
  - Personas favoritas.
- **Moderación:** filtro de palabras prohibidas (detecta variantes con puntos, espacios y números), límites anti-spam, reportes y panel de administración para revisar reportes, suspender usuarios y editar la lista de palabras.
- **Español e inglés:** detecta el idioma del navegador y tiene un botón para cambiarlo.

### Persona 3 Reload (paleta «Medianoche»)

- **Calculadora:** las 194 Personas (sin Episode Aigis), fusión de 2, búsqueda inversa, fusiones especiales, objetos de corazón y Personas de los compañeros con su evolución (con aviso de spoiler).
- **Vínculos sociales:** los 22 vínculos con los diálogos oficiales del juego, mejores respuestas por rango, rutas de romance y amistad, y seguimiento de progreso.
- **Respuestas de clase:** las 53 preguntas de profesores, ayudas a Junpei y exámenes, con el texto oficial.
- **Builds:** cadena de fusiones y skill cards (sin rasgos), con la misma comunidad que Royal.

## Tecnologías

- **React 18 + TypeScript**: interfaz por componentes, tipada.
- **Vite**: servidor de desarrollo y build.
- **React Router (HashRouter)**: rutas que funcionan en cualquier hosting estático.
- **CSS Modules + variables CSS**: estilos por componente y paleta centralizada por juego.
- **Supabase**: autenticación con Google y base de datos Postgres.
  - Las reglas de seguridad viven en la base: políticas RLS, el filtro de palabras, los límites anti-spam y la protección de campos de administrador.
- **Vitest**: tests del motor de fusiones, los filtros y los datos.
- **Cloudflare Workers** (archivos estáticos): hosting principal, que se publica solo con cada push a `main`.
- **GitHub Actions + GitHub Pages**: copia de respaldo que redirige al sitio principal.

La clave de Supabase que usa la web es la pública (publishable). Los permisos los controla la base de datos, no el navegador.

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

## Publicación

- **Cloudflare:** la configuración está en `wrangler.jsonc`. Cloudflare corre `npm run build` y después `npx wrangler deploy`. En Cloudflare el sitio vive en la raíz del dominio (`base: '/'`).
- **GitHub Pages:** lo publica `.github/workflows/`. Ahí el sitio vive en `/persona-guide-room/`, y un script en `index.html` redirige al dominio de Cloudflare conservando la sección abierta.

## Organización de carpetas

```
src/
├─ app/                 Router, layout por juego, cuenta, perfil, admin, «Sobre nosotros», 404
├─ core/
│  ├─ account/          Cliente de Supabase, sesión, progreso, favoritas y builds
│  ├─ games.ts          Registro de juegos
│  └─ types.ts          Tipos compartidos
├─ i18n/                Idioma: L(es, en) para la interfaz y data-en.json para los datos
├─ shared/
│  ├─ components/       Header, footer, botón de cuenta, selector de idioma...
│  └─ styles/           tokens.css (paleta por juego) y estilos globales
└─ games/
   └─ p5r/              Todo lo de Persona 5 Royal
      ├─ data/          Tablas propias + generated/ (datos importados) + confidentes
      ├─ fusion/        Motor de fusiones (TypeScript puro + tests)
      ├─ services/      Lógica separada de la interfaz (+ tests)
      ├─ components/    Componentes propios de P5R
      └─ pages/         Pantallas
public/                 Favicon e imagen de vista previa para redes (og.png)
scripts/                Importador de datos
docs/                   Informe y decisiones del proyecto
```

**Sumar un juego:** crear `src/games/<id>/`, registrarlo en `src/core/games.ts` y definir su paleta en `tokens.css` con `[data-game="<id>"]`.

## Datos

Las Personas, habilidades y reglas de fusión vienen de [aqiu384/megaten-fusion-tool](https://github.com/aqiu384/megaten-fusion-tool) (Unlicense, dominio público), importadas con el script de arriba. El resto de los textos de la guía están redactados con palabras propias y verificados jugando.

## Roadmap

- ~~**v1:** compendio completo, motor de fusiones, guía de confidentes~~ ✅
- ~~**v2:** cuentas, progreso de confidentes, favoritas, builds de la comunidad, moderación, versión en inglés~~ ✅
- ~~**v3:** Persona 3 Reload con su propia paleta~~ ✅
- **Persona 4 Golden:** calculadora con ilustraciones, vínculos, respuestas de clase, pronóstico de fusiones y builds.

## Licencia

Código bajo licencia [MIT](LICENSE). Persona y todo su contenido pertenecen a ATLUS / SEGA.

---

Hecho por **Juan** · [Contacto y donaciones](https://personaguy.personaguide.workers.dev/#/p5r/sobre-nosotros)
