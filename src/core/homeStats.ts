/**
 * Números de las portadas de cada juego. Están fijos para que la portada no tenga que bajar
 * todos los datos de las Personas (~100 KB) solo para contarlas.
 * homeStats.test.ts comprueba que sigan coincidiendo con los datos: si cambian, el test avisa.
 */
export const HOME_STATS = {
  p5r: { personas: 232, thieves: 9 },
  p4g: { personas: 205, special: 17, arcana: 24 },
  // Revival: datos provisorios de Golden hasta el lanzamiento
  p4r: { personas: 205, special: 17, arcana: 24 },
  p3r: { personas: 194, special: 22 },
  p5t: { personas: 206, special: 22, dlc: 13 },
  p5s: { personas: 67, special: 11, party: 10 },
  p5: { personas: 210, special: 21, party: 15 },
} as const;
