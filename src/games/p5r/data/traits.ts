/**
 * Qué hace cada rasgo (la pasiva especial de cada Persona en Royal).
 * Clave: nombre interno en inglés (el mismo de personas.json / party.json).
 * Fuentes: Megami Tensei Wiki («Traits in Persona 5 Royal») y megaten-fusion-tool.
 * Redacción propia en español; PS = salud y PE = energía, como en el juego.
 */
export type TraitGroup = 'persona' | 'ally' | 'treasure';

export interface TraitInfo {
  description: string;
  group: TraitGroup;
}

const P = (description: string): TraitInfo => ({ description, group: 'persona' });
const A = (description: string): TraitInfo => ({ description, group: 'ally' });

export const TRAITS: Record<string, TraitInfo> = {
  // Coste de PE por elemento
  'Heated Bloodline': P('Las habilidades de fuego cuestan la mitad de PE.'),
  'Drunken Passion': P('Las habilidades de fuego cuestan un 75 % menos de PE.'),
  'Frigid Bloodline': P('Las habilidades de hielo cuestan la mitad de PE.'),
  Cocytus: P('Las habilidades de hielo cuestan un 75 % menos de PE.'),
  'Electric Bloodline': P('Las habilidades eléctricas cuestan la mitad de PE.'),
  'Bargain Bolts': P('Las habilidades eléctricas cuestan un 75 % menos de PE.'),
  'Wind Bloodline': P('Las habilidades de viento cuestan la mitad de PE.'),
  "Vahana's Wings": P('Las habilidades de viento cuestan un 75 % menos de PE.'),
  'Psychic Bloodline': P('Las habilidades psi cuestan la mitad de PE.'),
  "Chi You's Blessing": P('Las habilidades psi cuestan un 75 % menos de PE.'),
  'Atomic Bloodline': P('Las habilidades nucleares cuestan la mitad de PE.'),
  'Atomic Hellscape': P('Las habilidades nucleares cuestan un 75 % menos de PE.'),
  'Blessed Bloodline': P('Las habilidades de bendición cuestan la mitad de PE.'),
  "Martyr's Gift": P('Las habilidades de bendición cuestan un 75 % menos de PE.'),
  'Cursed Bloodline': P('Las habilidades de maldición cuestan la mitad de PE.'),
  "Mother's Lament": P('Las habilidades de maldición cuestan un 75 % menos de PE.'),
  'Savior Bloodline': P('Las habilidades de curación cuestan la mitad de PE.'),
  'Grace of Mother': P('Las habilidades de curación cuestan un 75 % menos de PE.'),
  'Relief Bloodline': P('Las habilidades de apoyo cuestan la mitad de PE.'),
  'Ave Maria': P('Las habilidades de apoyo cuestan un 75 % menos de PE.'),
  'Allure of Wisdom': P('Las habilidades mágicas de ataque cuestan un 75 % menos de PE.'),
  'Just Die': P('Las habilidades de muerte instantánea no cuestan PE.'),
  'Grace of the Olive': P('Durante un 1 Más, las habilidades cuestan mucho menos.'),

  // Daño
  'Striking Weight': P('Las habilidades físicas hacen un 20 % más de daño.'),
  'Undying Fury': P('Las habilidades físicas hacen un 30 % más de daño.'),
  'Intense Focus': P('La magia contra un solo enemigo hace un 20 % más de daño.'),
  'Mighty Gaze': P('La magia contra todos los enemigos hace un 20 % más de daño.'),
  'Pagan Allure': P('La magia hace un 50 % más de daño (sin pasar el tope de daño).'),
  Relentless: P('Los ataques a un solo enemigo hacen más daño cuando golpean su debilidad.'),
  'Skillful Technique': P('Los Técnicos hacen un 25 % más de daño.'),
  'Universal Law': P('Los Técnicos hacen un 50 % más de daño.'),
  'Retaliating Body': P('Las réplicas (devolver ataques) hacen el doble de daño.'),
  'Inviolable Beauty': A('Las réplicas (devolver ataques) hacen el triple de daño.'),
  'Ailment Hunter': P('Hace un 25 % más de daño por cada enemigo que tenga un estado alterado.'),
  'Hollow Jester': A('Hace un 40 % más de daño por cada enemigo que tenga un estado alterado.'),
  'Frenzied Bull': P('Hace mucho más daño cuando le quedan menos de la mitad de los PS.'),
  'Bolstering Force': A('Hace más daño durante un 1 Más.'),
  'Skillful Combo': P('Los ataques a un solo enemigo hacen más daño después de un Relevo.'),
  'Linked Bloodline': P('Los ataques a un solo enemigo hacen mucho más daño después de un Relevo.'),
  'Draining Mouth': P('Las habilidades de absorción absorben el doble.'),
  'Will of the Sword': P('Carga y Concentrar potencian aún más el siguiente ataque. Empieza el combate con Concentrar.'),

  // Estados alterados y muerte instantánea
  'Foul Stench': P('Más probabilidad de causar estados alterados.'),
  'Foul Odor': P('Más probabilidad de causar estados alterados después de un Relevo.'),
  'Thermal Conduct': P('Más probabilidad de causar Quemadura después de un Relevo.'),
  'Static Electricity': P('Más probabilidad de causar Electrificación a enemigos derribados.'),
  'Ghost Nest': P('Más probabilidad de causar estados alterados a enemigos derribados.'),
  'Cold-Blooded': P('Más probabilidad de causar Congelación durante un 1 Más.'),
  'Deathly Illness': P('Más probabilidad de acertar las habilidades de muerte instantánea.'),
  Omen: P('Mucha más probabilidad de acertar las habilidades de muerte instantánea.'),
  'Rare Antibody': P('Menos probabilidad de sufrir estados alterados.'),
  Immunity: P('Es inmune a los estados alterados.'),

  // Curación
  Gluttonmouth: P('Las habilidades que recuperan PS curan un 50 % más.'),
  "Demon's Bite": P('Las habilidades que recuperan PS curan el doble.'),
  'Mouth of Savoring': P('Las habilidades que recuperan PE recuperan un 50 % más.'),
  Naranari: P('Las habilidades que recuperan PE recuperan el doble.'),
  'Hallowed Spirit': A('Las habilidades que recuperan PS y PE recuperan el doble.'),

  // Apoyo
  'Potent Hypnosis': P('Las mejoras (-kaja y críticos) que lanza duran 1 turno más.'),
  'Wealth of Lotus': P('Las mejoras (-kaja y críticos) que lanza duran 2 turnos más.'),
  'Internal Hypnosis': P('Las mejoras (-kaja y críticos) que recibe duran 1 turno más.'),
  'Positive Thoughts': P('Las mejoras (-kaja y críticos) que recibe duran 2 turnos más.'),

  // Defensa y otros
  'Crisis Control': P('Recibe menos daño cuando le golpean en su debilidad.'),
  'Bloodstained Eyes': P('Más evasión contra enemigos con estados alterados. Empieza el combate con Sukukaja.'),
  'Pinch Anchor': P('Puede usar las habilidades que solo funcionan cuando te rodean después de un Relevo.'),
  'Vitality of the Tree': P('Puede usar en cualquier momento las habilidades que solo funcionan cuando te rodean.'),
  'Gloomy Child': P('Activa las habilidades que dependen del clima (Lluvia, Nieve...) sin importar el tiempo que haga.'),
  'Circle of Sadness': A('Si recibe un golpe mortal, sobrevive con 1 PS (unas pocas veces por combate).'),
  'Country Maker': A('Ataque y defensa suben según lo completo que tengas el compendio.'),
  'God Maker': A('Más probabilidad de que se activen los rasgos de los aliados.'),

  // Rasgos de los compañeros (afectan a todo el grupo)
  'Raging Temper': A('Posibilidad de que el daño físico de los aliados aumente un 40 %.'),
  'Eccentric Temper': A('Posibilidad de que el daño físico de los aliados aumente un 80 %.'),
  'Proud Presence': A('Potencia las curaciones de todos los aliados.'),
  'Majestic Presence': A('Potencia las curaciones de los aliados y a veces cuestan la mitad.'),
  'Mastery of Magic': A('Posibilidad de que la magia de ataque de los aliados cueste un 30 % menos.'),
  'Pinnacle of Magic': A('Posibilidad de que la magia de ataque de los aliados cueste la mitad.'),
  'Scoundrel Eyes': A('Posibilidad de que los aliados esquiven los ataques físicos.'),
  'Unparalleled Eyes': A('Mucha más posibilidad de que los aliados esquiven los ataques físicos.'),
  'Gaia Pact': A('Los aliados causan Quemadura, Congelación y Electrificación con más facilidad.'),
  'Gaia Blessing': A('Los aliados causan Quemadura, Congelación y Electrificación con mucha más facilidad.'),
  'Icy Glare': A('Los aliados sufren menos estados alterados.'),
  'Cool Customer': A('Los aliados sufren muchos menos estados alterados.'),
  'Tactical Spirit': A('Posibilidad de que las habilidades de apoyo de los aliados cuesten la mitad.'),
  'Ingenious Spirit': A('Posibilidad de que las habilidades de apoyo y todopoderosas de los aliados cuesten la mitad.'),
  'Veil of Midnight': A('Posibilidad de que los aliados no sean derribados al recibir un golpe.'),
  'Veil of Sunrise': A('Mucha más posibilidad de que los aliados no sean derribados al recibir un golpe.'),
  'Explosive Scheme': A('Tras un ataque total, puede recuperar parte de los PS de todo el grupo.'),
  'Infinite Scheme': A('Tras un ataque total, puede recuperar todos los PS del grupo.'),
  'Hazy Presence': A('Más probabilidad de que los aliados hagan ataques de seguimiento.'),
  'Tag Team': A('Después de un Relevo, los objetos se pueden usar sin gastarlos.'),
  'Iron Heart': A('Después de un Relevo, las habilidades cuestan la mitad de PE. Empieza el combate con Tetrakarn y Makarakarn.'),

  // Personas tesoro
  'Ultimate Vessel': {
    group: 'treasure',
    description: 'Al usarla en una fusión, el resultado puede heredar uno de sus rasgos extra.',
  },
};

/**
 * Rasgos extra de cada Persona tesoro (Ultimate Vessel). Si alguna Persona de la fusión
 * ya tiene uno, se ofrece el alternativo (segundo valor).
 */
export const TREASURE_TRAITS: Record<string, [string, string | null][]> = {
  regent: [['Skillful Combo', 'Striking Weight'], ['Mighty Gaze', 'Intense Focus'], ['Skillful Technique', null]],
  'queen-s-necklace': [['Savior Bloodline', null], ['Relief Bloodline', 'Psychic Bloodline'], ['Potent Hypnosis', 'Internal Hypnosis']],
  'stone-of-scone': [['Relentless', 'Crisis Control'], ['Intense Focus', 'Skillful Technique'], ['Gluttonmouth', 'Draining Mouth']],
  'koh-i-noor': [['Bloodstained Eyes', 'Deathly Illness'], ['Crisis Control', 'Retaliating Body'], ['Rare Antibody', 'Foul Odor']],
  orlov: [['Heated Bloodline', 'Frigid Bloodline'], ['Electric Bloodline', 'Wind Bloodline'], ['Atomic Bloodline', 'Blessed Bloodline']],
  'emperor-s-amulet': [['Frigid Bloodline', 'Electric Bloodline'], ['Psychic Bloodline', 'Atomic Bloodline'], ['Wind Bloodline', 'Heated Bloodline']],
  'hope-diamond': [['Striking Weight', 'Mighty Gaze'], ['Retaliating Body', 'Relentless'], ['Internal Hypnosis', 'Pinch Anchor']],
  'crystal-skull': [['Ailment Hunter', 'Immunity'], ['Cursed Bloodline', 'Savior Bloodline'], ['Foul Stench', 'Bloodstained Eyes']],
  orichalcum: [['Blessed Bloodline', 'Cursed Bloodline'], ['Immunity', 'Foul Stench'], ['Mouth of Savoring', 'Gluttonmouth']],
};

export const traitDescription = (key: string | null | undefined): string | undefined =>
  key ? TRAITS[key]?.description : undefined;
