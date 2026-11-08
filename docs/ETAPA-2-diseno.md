# Etapa 2 — Diseño visual

Fecha: 08/11/2026

## Proceso

1. Propuesta visual en un lienzo de diseño (6 pantallas): Inicio, Catálogo, Ficha de Persona, Fusionar, Confidente e Íconos/Técnicos.
2. Revisión y cambios pedidos por Juan.
3. Implementación en React con la misma estructura.

**Acuerdo de trabajo:** toda función nueva se muestra primero como diseño y se programa recién después de aprobarla.

## Decisiones de diseño

- **Paleta:** negro de fondo, rojo como color principal, blanco para lectura y dorado para detalles. Todos los colores son variables en `src/shared/styles/tokens.css`, preparados para cambiar la paleta por juego.
- **Tipografía:** Anton (títulos), Barlow Condensed (etiquetas), Inter (texto).
- **Formas:** cortes diagonales, tarjetas inclinadas, animaciones suaves al pasar el mouse. Respeta `prefers-reduced-motion`.
- **Menú hamburguesa:** cambia de juego. P3R y P4G aparecen como "Próximamente".
- **Imágenes:** no se usa arte oficial. Un recuadro rayado marca dónde va cada imagen.
- **Íconos de elementos:** diseño propio con el código de colores del juego (15 íconos).
- **Habilidades:** cada skill muestra el ícono de su elemento. Al pasar el mouse aparece qué hace el elemento y, si causa un estado, con qué se hace un **Técnico** (nombre usado en la versión en español).
- **Confidentes:** opciones numeradas (Opción 1, 2, 3) con puntos. La mejor se marca en dorado, se avisa cuando todas empatan, las exclusivas de Royal llevan una marca azul y la marca de romance aparece solo en los confidentes que tienen esa ruta.
- **Seguimiento de progreso:** el interruptor se muestra como vista previa; guardar el progreso llega con las cuentas (v2).

## Pendientes conocidos

- Nombres oficiales en español (España) de los estados alterados y de los diálogos.
- Imágenes de Personas y retratos.
