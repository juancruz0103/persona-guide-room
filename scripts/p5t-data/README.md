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

Fusión: cuenta el nivel base de cada Persona (no el de la partida); reglas en `src/games/p5t/fusion/engine.ts`, casos en `fusion/check.test.ts`.

## Ladrones Fantasma (`party.py`)

`python3 party.py <carpeta MonoBehaviour> <raíz del repo>` arma `party.json` con:
- `skilltree_database` + `skilltree_treeskill_database` + `skilltree_name_database`: las 3 ramas de cada personaje,
  con la posición de cada nodo (PosX/PosY), sus padres, el costo en PC y si es la habilidad más fuerte (misión).
  Los textos con `{0}` se completan con el valor de la pasiva (`passive_skill_database`) o con lo que crece el alcance.
- `skilldatabase`: daño, costo, alcance y estado de las habilidades de su Persona (las mejoras son el id siguiente).
- `weapondatabase` + `weapon_make_database`: armas de fuego (el prefijo del id es el personaje) y la receta de la fusión
  de armas (tipo y nivel mínimo de cada Persona). Cada arma fabricada tiene hasta 4 versiones con distintos valores.

## Imágenes de los Ladrones

- Retratos: `charadata_000XX051` (Erina `00011000`). Cada uno es una hoja con 2 poses en color y sus siluetas rojas;
  se recorta la segunda pose en color (la pose normal) y se descartan las siluetas. Oracle no tiene retrato (es navegadora).
- Persona de cada uno: `party_persona_10XX000` (Ernesto `1021000`), la versión más grande.
- Dónde aparece cada Persona: `stage_reward_database` (misión → sorteo) + `persona_lottery_number_database` (sorteo → Personas),
  con el nombre de la misión de `stage_database`. Las misiones 5xxx son del DLC «Repaint Your Heart».
