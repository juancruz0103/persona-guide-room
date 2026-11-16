# Pronóstico de fusiones (P4G)

El calendario no está en los textos extraídos del juego: sale de la Megami Tensei Wiki
("Calendar in Persona 4 Golden") y se guarda en `forecast-guide.txt` (fecha|condición|efecto).

`python3 build_forecast.py <repo>` lo pasa a `src/games/p4g/data/generated/forecast.json` con ids de Personas,
skills y Arcanas, para que la web muestre los nombres oficiales en español e inglés.
