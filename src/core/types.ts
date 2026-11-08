/**
 * Tipos compartidos entre juegos.
 * Cada juego puede extenderlos, pero no debe asumir que las mecánicas
 * de otro juego son iguales (ver docs/ETAPA-1-informe.md).
 */

/** Identificador de juego. Se usa en rutas (/p5r/...) y en el tema (data-game). */
export type GameId = 'p5r' | 'p3r' | 'p4g';

export interface GameTool {
  id: string;
  /** Ruta relativa al juego, ej: "calculadora" → /p5r/calculadora */
  path: string;
  title: string;
  description: string;
}

export interface GameInfo {
  id: GameId;
  name: string;
  shortName: string;
  available: boolean;
  /** Color principal, se muestra en el menú de juegos */
  swatch: string;
  tools: GameTool[];
}
