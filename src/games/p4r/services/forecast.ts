import forecastJson from '../data/generated/forecast.json';

export type Condition =
  | { type: 'result'; persona: string }
  | { type: 'resultArcana'; arcana: string }
  | { type: 'material'; personas: string[] }
  | { type: 'materialArcana'; arcanas: string[] };
export type Effect =
  | { type: 'stats' }
  | { type: 'skillChange' }
  | { type: 'linkExp' }
  | { type: 'skill'; skill: string }
  | { type: 'skillKind'; kind: 'recovery' | 'wind' | 'ice' | 'fire' | 'elec' | 'support' };
export interface ForecastDay { month: number; day: number; condition: Condition | null; effects: Effect[] }

/** Pronóstico de fusiones del Revival: qué día, qué hay que fusionar y qué bonus da. */
export const FORECAST = (forecastJson as unknown as { days: ForecastDay[] }).days;

/** Año del juego: de abril a marzo. */
export const FORECAST_MONTHS = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3];
