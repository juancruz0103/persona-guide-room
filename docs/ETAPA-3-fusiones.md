# Etapa 3 — Compendio completo y motor de fusiones

Fecha: 08/11/2026

## Datos

- **Fuente:** [aqiu384/megaten-fusion-tool](https://github.com/aqiu384/megaten-fusion-tool) (Unlicense), solo archivos de Royal (`roy-*`).
  El commit usado queda registrado en `src/games/p5r/data/generated/meta.json`.
- **Importación:** `scripts/import-aqiu384/import.mjs` convierte los JSON de la fuente al formato propio. Solo lee JSON; no ejecuta código de la fuente.
- **Resultado:** 232 Personas (9 Treasure Demons, 25 DLC, 24 de fusión especial) y 383 skills. La importación terminó sin avisos.

### Datos que no se muestran (todavía)

| Dato | Motivo |
|------|--------|
| `itemizationAlt` ("itemr" en la fuente) | Significado sin confirmar (posiblemente la itemización durante una Alarma de fusión). |
| Descripción de skills | La fuente no la trae. |
| Costo de skills (SP / % HP) | Se importa, pero falta diseñar dónde mostrarlo. |

## Reglas del motor (`src/games/p5r/fusion/engine.ts`)

| # | Caso | Regla |
|---|------|-------|
| 1 | Receta especial de 2 ingredientes | Tiene prioridad sobre todo (ej.: Belial + Nebiros = Alice). |
| 2 | Arcanas distintas | La tabla da la Arcana. Sale la Persona de **menor** nivel con `A + B ≤ 2·nivel − 1`. Si ninguna llega, sale la de mayor nivel. Si sale un ingrediente, se pasa a la siguiente. |
| 3 | Misma Arcana | Sale la Persona de **mayor** nivel con `nivel ≤ (A+B)/2 + 1`, sin contar a los ingredientes. Si no hay, no hay resultado. |
| 4 | Persona + Treasure Demon | Misma Arcana de la Persona, sube o baja 1 o 2 escalones según la tabla de tesoros. |
| 5 | Dos Treasure Demons | Tabla de Arcanas. Sale la primera Persona con `2·nivel > A + B`. |
| — | Nunca salen | Personas de fusión especial (fuera de su receta) ni Treasure Demons. |
| — | Opciones | Desactivar DLC o tesoros los saca **de los ingredientes y de los resultados**, como pasa en el juego. |

### Diferencias con la referencia (decisiones tomadas)

1. **Misma Arcana:** la referencia excluye a un ingrediente y "salta" al otro, y según desde qué lado se calcule puede dar resultados distintos. El motor excluye a los dos: es simétrico (A+B = B+A) y coincide con el cálculo de la referencia desde el lado correcto.
2. **Arcanas distintas sin escalón libre:** si el resultado sería un ingrediente y no hay otra Persona más arriba, la referencia devuelve el mismo ingrediente. El motor devuelve "sin resultado", porque una Persona no puede fusionarse en sí misma.
3. **Treasure Demon + Persona especial:** la referencia lo calcula de dos formas distintas según la pantalla. Se usa una de ellas y el resultado se marca **⚠ no verificado** en la interfaz.

## Verificación

48 tests automáticos (`npm test`), entre ellos:

- **Reglas aisladas:** cada regla se prueba con datos mínimos inventados para el test.
- **Propiedades sobre las 232 Personas:** la fusión es simétrica, nunca da un ingrediente ni un Treasure Demon, y las especiales solo salen con su receta.
- **Verificación cruzada 1:** una segunda implementación, independiente, del cálculo inverso de la referencia (dado un resultado, qué pares lo producen). Coincide en todos los casos menos uno documentado: misma Arcana con los ingredientes justo en los dos escalones siguientes al resultado (por ejemplo Baal + Odin = Oberon). Ahí el cálculo inverso de la referencia usa `<` en lugar de `≤`, pero su propio cálculo hacia adelante da el mismo resultado que nuestro motor.
- **Verificación cruzada 2:** 24 recetas publicadas por TheGamer coinciden todas. La guía calcula **sin DLC**: con DLC activado, en Fool salen Orpheus F o Izanagi en lugar de Arsene, High Pixie o Legion.

## Pendiente

- Confirmar en el juego el caso ⚠ (Treasure Demon + Persona especial).
- Fusión avanzada (3 o más Personas): hoy se listan los ingredientes, sin calculadora propia.
