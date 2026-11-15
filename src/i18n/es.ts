/**
 * Textos de la interfaz en español.
 * Para sumar un idioma: crear otro archivo con las mismas claves.
 * Los nombres del juego (Personas, skills, confidentes) NO se traducen.
 */
import { isEn } from './index';

export const es = {
  nav: {
    home: 'Inicio',
    calculator: 'Calculadora',
    confidants: 'Confidentes',
    school: 'Clases',
    soon: 'Próximamente',
    about: 'Sobre nosotros',
    openGameMenu: 'Cambiar de juego',
    mainMenu: 'Menú principal',
  },
  gameMenu: {
    title: 'Elegí el juego',
    current: 'Actual',
    soon: 'Próximamente',
    note: 'A futuro, cada juego cambia la paleta completa de la web (el cuadradito muestra su color principal).',
  },
  footer: {
    disclaimer: 'Proyecto fan, no oficial. Persona es propiedad de ATLUS / SEGA.',
    data: 'Datos de Personas: aqiu384/megaten-fusion-tool (dominio público).',
    madeBy: 'Hecho por Juan',
  },
  common: {
    level: 'Nv',
    enter: 'Entrar →',
    back: '← Volver',
    imageHere: 'Imagen de Persona',
  },
} as const;

export const en: typeof es = {
  nav: {
    home: 'Home',
    calculator: 'Calculator',
    confidants: 'Confidants',
    school: 'Classes',
    soon: 'Coming soon',
    about: 'About us',
    openGameMenu: 'Change game',
    mainMenu: 'Main menu',
  },
  gameMenu: {
    title: 'Choose the game',
    current: 'Current',
    soon: 'Coming soon',
    note: 'In the future, each game changes the whole color palette of the site (the little square shows its main color).',
  },
  footer: {
    disclaimer: 'Unofficial fan project. Persona is property of ATLUS / SEGA.',
    data: 'Persona data: aqiu384/megaten-fusion-tool (public domain).',
    madeBy: 'Made by Juan',
  },
  common: {
    level: 'Lv',
    enter: 'Enter →',
    back: '← Back',
    imageHere: 'Persona image',
  },
} as unknown as typeof es;

/** Textos de la interfaz en el idioma actual. */
export const t = (): typeof es => (isEn() ? en : es);
