# Extracción de textos oficiales de Persona 3 Reload

Los archivos salen de FModel (UE 4.27, exportación "Properties (.json)") a `Desktop\P3R-datos`.

- `bmd.py`: lector de los mensajes de Atlus (BMD, big-endian, texto UTF-8; las funciones van como `0xFE` + `(b & 0x0F) * 2` bytes). Lee el campo `mBuf` de cada `BmdAsset`.
- Nombres oficiales: `L10N/<idioma>/Xrd777/Blueprints/common/Names` (Personas, habilidades, Arcanas y elementos). Se emparejan español e inglés por posición → `src/games/p3r/data/generated/names-es.json`.
- Nada de la carpeta `Astrea` (Episode Aigis).
