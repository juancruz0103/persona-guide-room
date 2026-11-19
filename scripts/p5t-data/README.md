# Datos de Persona 5 Tactica

Todo sale de los archivos del juego (versión de Xbox/PC, Unity IL2CPP con paquetes Addressables).

1. Con [AssetStudioMod](https://github.com/aelurum/AssetStudio) se carga la carpeta
   `Content\Persona 5 Tactica_Data\StreamingAssets\aa\StandaloneWindows64`.
2. Filtro `database`, tipo MonoBehaviour → *Export → Filtered assets* (sale en JSON).
3. Filtro `persona_ore`, tipo Texture2D → *Export → Filtered assets* (PNG de 2048 px).
4. `python3 build.py <carpeta MonoBehaviour> <raíz del repo> [carpeta Texture2D]`

Qué usa:
- `persona_ore_database`: Personas (nivel, tipo, stats y crecimiento, si sale por fusión normal, desbloqueo).
- `persona_ore_effect_database`: habilidad única de cada Persona (mismo id) y la heredada inicial (`InheritanceSkillId`).
- `persona_ore_union_database`: tabla de tipos (tipo + tipo → tipo).
- `persona_ore_union_sp_database`: fusiones especiales (id = resultado).
- `word_database` de español (es-ES) e inglés: todos los nombres y textos oficiales.
- Imágenes: `persona_ore_XXX` tiene el mismo número que la Persona.

`Unlock` del juego: 1 = misión, 2 = Persona invitada de otros juegos, 101 = Pícaros de bonificación,
102 = DLC «Picaro Summoning Pack & Raoul» (lista confirmada con las guías).

Fusión: reglas en `src/games/p5t/fusion/engine.ts`, casos en `fusion/check.test.ts`.
