# Persona Guide Room — Etapa 1: Investigación y propuesta técnica

> Estado: borrador para revisión · Fecha: 08/11/2026
> Alcance: Persona 5 Royal (P5R)

---

## 0. Decisiones acordadas

| # | Tema | Decisión |
|---|------|----------|
| 1 | Tecnologías | Vite + React + TypeScript. Sitio estático publicado en GitHub Pages. |
| 2 | Idioma | Interfaz en español. Nombres oficiales del juego en inglés. Textos de UI en archivos separados para sumar idiomas después. |
| 3 | Calculadora v1 | Fusión normal de 2 Personas + búsqueda inversa + fusiones especiales. **Opción para desactivar Treasure Demons y Personas DLC.** |
| 4 | Seguimiento | v1: solo guía. v2: login con seguimiento activable/desactivable, favoritos y otras funciones. |
| 5 | Imágenes | Arquitectura preparada para imágenes, sin arte oficial por ahora. Se muestra un **marcador de posición** donde irá cada imagen. |
| 6 | Confidentes v1 | Como mínimo, todos los Ladrones Fantasma principales. |
| 7 | Repositorio | Carpeta local conectada + repositorio propio en GitHub. |

---

## 1. Fuentes consultadas

| Fuente | Uso | Licencia / condiciones |
|--------|-----|------------------------|
| **aqiu384 / megaten-fusion-tool** (GitHub) | Fuente principal de datos de Personas, skills y reglas de fusión | **Unlicense (dominio público)**: se pueden reutilizar los datos legalmente. Se da crédito igual, por cortesía. |
| Calculadora web de aqiu384 (P5R) | Referencia funcional (qué secciones tiene, qué muestra) | Solo como guía. No se copia código ni diseño. |
| RPG Site — guía de confidentes de P5R | Fuente principal de respuestas por rango | Texto con copyright. Se usan **los datos** (qué opción da más puntos, qué se desbloquea), **redactados con palabras propias** y con atribución. |
| Guías de fusión (TheGamer, Samurai Gamers, Steamah) | Contraste de reglas: fórmula de nivel y Treasure Demons | Solo para verificar. |
| Megami Tensei Wiki (Fandom) | Contraste del listado de Personas (Etapa 3) | Solo para verificar. |

**Importante:** el repositorio de aqiu384 guarda los datos de P5R dentro de la carpeta de P5, en archivos con prefijo `roy-`. Solo usamos esos archivos, para no mezclar datos de P5 original (regla 2).

---

## 2. Cantidad de Personas identificadas

| Grupo | Cantidad | Notas |
|-------|---------:|-------|
| Entradas del compendio P5R | **232** | Archivo `roy-demon-data.json` |
| ↳ Treasure Demons | 9 | Se consiguen en Palacios / Mementos. No se obtienen por fusión. |
| ↳ Personas DLC (incluye versiones *Picaro*) | 25 | 12 sets de 2 + Raoul |
| ↳ Resto (normales + especiales) | 198 | |
| Personas iniciales de los Ladrones Fantasma | 10 | Archivo aparte. **No se fusionan.** Útiles para la guía de confidentes. |

⚠️ **A verificar en la Etapa 3:** contrastar el total con una segunda fuente (Megami Tensei Wiki).

---

## 3. Estructura de los datos obtenidos

### 3.1 Archivos fuente (aqiu384, P5R)

| Archivo | Contenido |
|---------|-----------|
| `roy-demon-data.json` | Ficha de cada Persona |
| `roy-party-data.json` | Personas iniciales de los Ladrones Fantasma |
| `skill-data.json` + `roy-skill-data.json` | Skills (las de Royal se aplican encima de las de P5) |
| `roy-fusion-chart.json` | Tabla de Arcanas: qué Arcana resulta de combinar otras dos (24 × 24) |
| `roy-element-chart.json` | Tabla de Treasure Demons: cuántos "escalones" sube o baja el resultado según la Arcana |
| `roy-special-recipes.json` | Recetas especiales (lista fija de ingredientes) y Treasure Demons |
| `roy-demon-unlocks.json` | Condiciones de desbloqueo: historia, confidente al máximo, DLC |
| `roy-fusion-prereqs.json` | Dónde se consigue cada Treasure Demon |
| `comp-config.json` | Orden de Arcanas, elementos y códigos de resistencia |

### 3.2 Campos por Persona (formato original)

| Campo | Significado | Estado |
|-------|-------------|--------|
| `lvl` | Nivel base | ✅ |
| `race` | Arcana (las variantes DLC *Picaro* usan el sufijo " P") | ✅ |
| `resists` | 10 caracteres, uno por elemento: Físico, Arma, Fuego, Hielo, Eléctrico, Viento, Psi, Nuclear, Bendición, Maldición. Códigos: `w` débil, `-` neutral, `s` resiste, `n` nulo, `r` refleja, `d` absorbe | ✅ |
| `skills` | Skill → nivel en que se aprende. Valores menores a 1 (0.1, 0.2…) = skills iniciales, en ese orden | ✅ |
| `stats` | Fuerza, Magia, Resistencia, Agilidad, Suerte | ✅ |
| `inherits` | Tipo de herencia de skills | ✅ |
| `trait` | Rasgo (mecánica nueva de Royal) | ✅ |
| `item` / `itemr` | Itemización y una variante alternativa | ⚠️ Confirmar qué representa `itemr` |
| `steps` | Datos de crecimiento de stats | ⚠️ Significado sin confirmar. No se mostraría en la v1. |

### 3.3 Esquema propio propuesto (normalizado)

Los datos de aqiu384 se convierten con un script a un formato propio, legible y documentado:

```jsonc
// src/games/p5r/data/personas.json (una entrada)
{
  "id": "arsene",                 // identificador para URLs
  "name": "Arsene",
  "arcana": "fool",
  "level": 1,
  "flags": { "dlc": false, "treasure": false, "special": false, "picaro": false },
  "unlock": null,                 // o { "type": "confidant", "arcana": "fool", "rank": 10 }
  "resistances": { "phys": "neutral", "gun": "neutral", "fire": "neutral", "...": "..." },
  "stats": { "st": 2, "ma": 2, "en": 2, "ag": 3, "lu": 1 },
  "skills": [
    { "skill": "eiha", "level": null, "order": 1 },   // null = skill inicial
    { "skill": "dodge-curse", "level": 4 }
  ],
  "inheritance": "curse",
  "trait": "...",
  "itemization": "...",
  "image": null,                  // null = se muestra el marcador de posición
  "source": "aqiu384"
}
```

Ventajas: el código de la web nunca depende del formato raro de la fuente, y si mañana cambiamos de fuente solo se reescribe el script de conversión.

---

## 4. Información verificada

- ✅ Licencia de la fuente principal: dominio público.
- ✅ Datos separados de P5 original (solo archivos `roy-`).
- ✅ Tabla de Arcanas de Royal, con las dos Arcanas nuevas (Faith y Councillor).
- ✅ Tabla de Treasure Demons: 9 tesoros × 24 Arcanas.
- ✅ 24 fusiones especiales con ingredientes fijos. Tres son de 2 ingredientes (Alice, Ardha, Shiva); el resto son de 3 a 6.
- ✅ 23 Personas que requieren un confidente al rango 10.
- ✅ Desbloqueos por historia (Tercer Semestre, Nueva Partida+) y por DLC.
- ✅ Fórmula de nivel contrastada entre el código de aqiu384 y guías de fusión.

## 5. Información faltante o a revisar

| Tema | Situación | Propuesta |
|------|-----------|-----------|
| Descripciones de Personas | No están en la fuente (y el texto del compendio del juego tiene copyright) | Campo opcional. En la v1 no se muestra. |
| Descripciones de skills | La fuente tiene elemento, costo, poder y objetivo, pero no la descripción | En la v1 mostrar los datos técnicos. Las descripciones se redactan después. |
| Experiencia | No aparece en los datos de Personas | Se omite en la v1. |
| `itemr`, `steps` | Significado no confirmado | Investigar en la Etapa 3. No se muestra hasta confirmarlo. |
| Personas iniciales de los Ladrones | Algunas skills tienen códigos especiales (ej. 3588) y hay un campo mal escrito (`sesists`) en la fuente | El script de conversión los marca como "a revisar". |
| Fusion Alarm, Ejecuciones de la Sala de Terciopelo, herencia de skills | Mecánicas fuera del alcance acordado | Roadmap futuro. |
| Total de Personas | 232 según una sola fuente | Contrastar con la Megami Tensei Wiki. |

---

## 6. Propuesta de implementación de las fusiones

La lógica vive en un módulo **TypeScript puro** (`src/games/p5r/fusion/`), sin React. La interfaz solo le pide resultados.

### 6.1 Reglas

**A. Arcanas distintas**
1. La tabla de Arcanas da la Arcana del resultado.
2. Nivel objetivo = (nivel A + nivel B) / 2 + 0,5.
3. Resultado = la Persona de **menor nivel** de esa Arcana cuyo nivel base sea **≥ nivel objetivo**. Si no hay ninguna, se toma la de mayor nivel.
4. Las Personas especiales y los Treasure Demons **nunca** salen como resultado normal.
5. Si el resultado es igual a un ingrediente, se pasa a la siguiente.

**B. Misma Arcana**
- Se busca hacia **abajo**: la Persona de mayor nivel de esa Arcana con nivel ≤ (A + B) / 2 + 1, salteando los ingredientes.

**C. Persona + Treasure Demon**
- El resultado queda en la **misma Arcana**, y sube o baja 1 o 2 escalones según la tabla de Treasure Demons.

**D. Dos Treasure Demons**
- Se aplica la regla normal (A).

**E. Recetas especiales**
- Ingredientes fijos. Las de 2 ingredientes **reemplazan** al resultado normal (por ejemplo, Belial + Nebiros da Alice).
- Las de 3 o más se muestran como receta en la ficha y en la búsqueda inversa.

**F. Desbloqueos**
- Cada resultado muestra su condición (confidente al rango 10, historia, Nueva Partida+, DLC).

### 6.2 Opciones del usuario (pedido tuyo)
- **Incluir Treasure Demons** (activado / desactivado)
- **Incluir Personas DLC** (activado / desactivado)

Al desactivar una opción, esas Personas se quitan **de los ingredientes y de los resultados**. Esto cambia los resultados, igual que en el juego cuando no tenés esos DLC.

### 6.3 Funciones del motor

```ts
fuse(a, b, options)        // → Persona resultante (o null)
recipesFor(target, options) // → lista de pares que dan esa Persona (búsqueda inversa)
specialRecipe(target)       // → ingredientes fijos, si es especial
```

### 6.4 Validación
- Tests automáticos (Vitest) con casos conocidos: fusiones normales, de misma Arcana, especiales de 2 ingredientes y con Treasure Demons.
- Comparación de una muestra contra la calculadora de aqiu384.
- Regla del proyecto: si un caso no coincide, **no se publica** hasta resolverlo.

---

## 7. Guía de confidentes — hallazgos

- RPG Site tiene una página índice y **una subpágina por confidente** (21 en total).
- Cada subpágina trae, por rango: situación, opciones y **puntos numéricos** (por ejemplo +2 o +3). Marca qué contenido es exclusivo de Royal.
- Horarios y ubicación aparecen de forma general, no por rango.

**Confidentes de la v1 (Ladrones Fantasma):** Ryuji (Chariot), Morgana (Magician), Ann (Lovers), Yusuke (Emperor), Makoto (Priestess), Futaba (Hermit), Haru (Empress), Akechi (Justice), Kasumi (Faith).

Esquema propuesto (un archivo por confidente):

```jsonc
// src/games/p5r/data/confidants/ryuji.json
{
  "id": "ryuji",
  "name": "Ryuji Sakamoto",
  "arcana": "chariot",
  "phantomThief": true,
  "romance": false,
  "availability": { "days": [...], "location": "...", "notes": "..." },
  "ranks": [
    {
      "rank": 2,
      "conversations": [
        {
          "prompt": "Resumen propio de la situación",
          "options": [
            { "text": "...", "points": 3, "best": true },
            { "text": "...", "points": 0 }
          ],
          "royalOnly": false,
          "romance": false
        }
      ],
      "unlocks": [{ "name": "...", "description": "..." }]
    }
  ],
  "sources": ["rpgsite"],
  "verified": false
}
```

⚠️ Los textos de las opciones de diálogo son del juego. Se citan **solo las opciones** (frases cortas necesarias para identificarlas) y todo lo demás se redacta con palabras propias.

---

## 8. Arquitectura propuesta

```
persona-guide-room/
├─ docs/                     ← este informe, fuentes, decisiones
├─ scripts/
│  └─ import-aqiu384/        ← convierte los datos fuente al esquema propio
├─ public/
│  └─ assets/p5r/            ← imágenes futuras (personas/, confidants/)
└─ src/
   ├─ app/                   ← router, layout general, menú
   ├─ core/                  ← tipos compartidos y registro de juegos
   ├─ shared/                ← componentes y estilos reutilizables
   │  ├─ components/         ← tarjetas, filtros, marcador de imagen...
   │  └─ styles/             ← paleta, tipografía, animaciones
   ├─ i18n/es/               ← textos de la interfaz
   └─ games/
      └─ p5r/                ← TODO lo de Persona 5 Royal
         ├─ data/            ← personas.json, skills.json, charts, confidants/
         ├─ fusion/          ← motor de fusiones (TS puro + tests)
         ├─ pages/           ← Calculadora, Ficha, Confidentes...
         └─ game.config.ts   ← nombre, herramientas disponibles, rutas
```

**Por qué así:** cada juego es un módulo cerrado dentro de `games/`. Sumar Persona 3 Reload es agregar `games/p3r/` y registrarlo, sin tocar P5R (regla 11). Para el login de la v2, se suma una capa `services/` (probablemente con Supabase), sin cambiar la estructura.

**Detalles técnicos:**
- **Rutas:** `HashRouter` (URLs con `#/`), porque GitHub Pages no soporta rutas internas sin trucos.
- **Estilos:** CSS Modules + variables de color globales (rojo, negro, blanco, dorado). Sin librerías de componentes, para lograr la estética de P5R.
- **Rendimiento:** cada juego y cada herramienta se carga por separado (lazy loading).

---

## 9. Roadmap resumido

| Etapa | Entregable |
|-------|-----------|
| 1 ✅ | Este informe |
| 2 | Diseño visual navegable: inicio, menú, tarjetas, fichas, marcador de imagen, mobile |
| 3 | Calculadora: datos convertidos, catálogo, filtros, fichas, motor de fusiones con tests |
| 4 | Guía de confidentes: los 9 Ladrones Fantasma completos |
| 5 | Pruebas, README, publicación en GitHub Pages |
| v2 | Login, seguimiento de confidentes, favoritos |
| Futuro | Resto de confidentes, imágenes, descripciones de skills, otros idiomas, P3R / P4G |
