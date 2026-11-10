# Fotos de Personas

Fotos de Juan, sacadas del juego:

- Dos fotos por Persona, capturas de pantalla completas del juego.
- Nombre: `<nombre de la Persona>-de` (ángulo hacia la derecha) y `<nombre de la Persona>-iz` (hacia la izquierda).
- `-de` va en la ficha de la Persona; `-iz`, en la calculadora, las tarjetas del catálogo y la vista previa al pasar el mouse.
- Se convierten con `scripts/import-photos/personas.py` (quita la franja del menú, los botones y los bordes; WebP).
- Quedan en `src/games/p5r/assets/personas/<id>-de.webp` y `-iz.webp`. Donde no hay foto se ve el marcador.
- Hechas: las 29 Personas que empiezan con A (10/11).

## Confidentes

- Una sola foto por confidente (retrato de la ficha y de la tarjeta del índice): la silueta de la pantalla
  de habilidades del juego (`<nombre>-full.png`), recortada en cuadrado. Quedan en `assets/confidants/<id>.webp`.
- Recorte de las siluetas: (1090, 50, 1790, 750) de la captura de 1919×1079. Igor, Morgana, Makoto, Haru, Ann,
  Caroline y Justine y Oda usan (1130, 170, 1750, 790): más zoom y la cara más arriba (pedido de Juan).
- Caroline y Justine: la foto se cambiará por spoilers; irá un botón en la esquina para alternar imágenes.
