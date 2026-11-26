# Persona 4 Revival · plan para el día del lanzamiento (18/2/2027)

La sección ya está armada en `src/games/p4r` (copia de Golden, colores de Revival) pero **no se publica**:
solo aparece con `npm run dev` o abriendo la web con `?preview=p4r` (se apaga con `?preview=off`).
Mientras tanto usa los datos de Golden como provisorios.

## Qué sabemos del juego
- Unreal Engine (como P3 Reload). Texto en español de España y Latinoamérica.
- Afinidades: **un solo Físico** + Fuego, Hielo, Eléctrico, Viento, Luz y Oscuridad (+ Todopoderoso). Igual que Golden.
- Colores del juego: PS `#51aae1 → #28d6e6`, PE `#6bdb1e → #92e71c` (en la web solo se usan en textos, sin barras).
- Personas DLC: Set 1 y 2 de P3R (Orpheus, Thanatos, Messiah / Athena, Psyche, Orpheus Telos) y Set 1 y 2 de P5R
  (Arsène, Raoul, Satanael / el set 2 se confirma el día 1). Juan tiene la edición con los DLC.

## Día 1 (en este orden)

1. **Fusiones (lo más rápido).** aqiu384/megaten-fusion-tool tuvo P3 Reload completo al día siguiente del lanzamiento.
   Cuando aparezca la carpeta de Revival en `src/app/`:
   ```
   git clone --depth 1 https://github.com/aqiu384/megaten-fusion-tool /tmp/aqiu
   node scripts/import-p4r/import.mjs /tmp/aqiu/src/app/<carpeta>/data $(git -C /tmp/aqiu rev-parse HEAD)
   ```
   Revisar que el formato sea igual al de Golden (`p4/data`); si se parece más al de P3 Reload, adaptar desde `scripts/import-p3r`.
   Correr los tests del motor (`src/games/p4r/fusion/engine.test.ts`) y probar 3 o 4 fusiones en el juego.

2. **Nombres oficiales en español, descripciones e imágenes (FModel).** Mismo proceso que P3 Reload (`scripts/p3r-extract`):
   - Abrir la carpeta `Content/Paks` del juego en FModel (solo lectura, no se toca la instalación).
   - Cargar la clave AES que publique la comunidad (Discord de Persona Modding). No se saca del programa.
   - Si FModel pide "mappings" (.usmap), usar el que comparta la comunidad.
   - Exportar como "Properties (.json)" las carpetas de nombres y textos (`L10N/es`, `L10N/en`) a `Desktop\P4R-datos`.
   - Texturas de las Personas a PNG para pasarlas a WebP.

3. **Vínculos y clases.** Empezar con los de Golden (ya están en `src/games/p4r/data`) y corregir con lo que cambió en Revival
   (guías de Game8, RPG Site, etc. y los textos exportados). Revisar el pronóstico y las skill cards: eran del Golden.

4. **Publicar.**
   - Borrar `src/core/preview.ts`, sacar la condición en `src/core/games.ts` y el aviso `PreviewBanner`.
   - Supabase: sumar `'p4r'` a `builds_game_check` (como se hizo con `'p5'`).
   - `src/app/MyProfile.tsx`: favoritos `p4r:` y tarjeta de builds.
   - Actualizar `HOME_STATS.p4r` (el test avisa) y la imagen para redes (`public/og-saga.png`).
