/**
 * Habilidades de VÍNCULO de Persona 5 Strikers (30 en total, 1449 puntos para tenerlas todas al máximo).
 * Costos y niveles: Megami Tensei Wiki (megatenwiki.com/wiki/Bond), contrastados con Samurai Gamers.
 * Cómo se desbloquean: Samurai Gamers.
 * Nombres y textos en español: traducción propia (provisoria) salvo los marcados `official`,
 * que salen de capturas del juego en español.
 */
export type BondRow = 'stats' | 'combat' | 'style' | 'perks' | 'explore';

export interface BondSkill {
  id: string;
  row: BondRow;
  nameEs: string;
  nameEn: string;
  /** Nombre y descripción en español sacados del juego */
  official?: boolean;
  descEs: string;
  descEn: string;
  /** Costo de cada nivel, en orden. Si no se conoce el detalle, `costs` queda vacío y se usa `total`. */
  costs: number[];
  maxLevel: number;
  total: number;
  /** Efecto por nivel (si es igual en todos) */
  perLevelEs?: string;
  perLevelEn?: string;
  unlockEs: string;
  unlockEn: string;
}

const STAT_COSTS = [3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7, 8, 8, 9, 9, 10];
const STORY_0727 = { unlockEs: 'Historia (27/7)', unlockEn: 'Story (7/27)' };
const STORY_0801 = { unlockEs: 'Historia (1/8)', unlockEn: 'Story (8/1)' };
const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
const skill = (s: Omit<BondSkill, 'total' | 'maxLevel'> & { total?: number; maxLevel?: number }): BondSkill => ({
  ...s,
  maxLevel: s.maxLevel ?? s.costs.length,
  total: s.total ?? sum(s.costs),
});

const stat = (id: string, es: string, en: string, perEs: string, perEn: string, dEs: string, dEn: string) =>
  skill({ id, row: 'stats', nameEs: es, nameEn: en, descEs: dEs, descEn: dEn, costs: STAT_COSTS, perLevelEs: perEs, perLevelEn: perEn, ...STORY_0727 });

export const BOND_SKILLS: BondSkill[] = [
  stat('hp', 'Aumento de PS', 'HP Boost', '+5 PS', '+5 HP', 'Aumenta los PS máximos de todo el equipo.', 'Raises max HP for the whole party.'),
  stat('sp', 'Aumento de PE', 'SP Boost', '+3 PE', '+3 SP', 'Aumenta los PE máximos de todo el equipo.', 'Raises max SP for the whole party.'),
  stat('st', 'Aumento de Fuerza', 'Strength Boost', '+1 Fr', '+1 St', 'Aumenta la Fuerza de todo el equipo. Sube el daño físico.', 'Raises Strength for the whole party. Boosts physical damage.'),
  stat('ma', 'Aumento de Magia', 'Magic Boost', '+1 Ma', '+1 Ma', 'Aumenta la Magia de todo el equipo. Sube el daño mágico.', 'Raises Magic for the whole party. Boosts magic damage.'),
  stat('en', 'Aumento de Resistencia', 'Endurance Boost', '+1 Rs', '+1 En', 'Aumenta la Resistencia de todo el equipo. Baja el daño que recibís.', 'Raises Endurance for the whole party. Lowers damage taken.'),
  stat('ag', 'Aumento de Agilidad', 'Agility Boost', '+1 Ag', '+1 Ag', 'Aumenta la Agilidad de todo el equipo. Sube los críticos y la evasión automática.', 'Raises Agility for the whole party. Boosts criticals and auto-evasion.'),
  stat('lu', 'Aumento de Suerte', 'Luck Boost', '+1 Su', '+1 Lu', 'Aumenta la Suerte de todo el equipo. Ayuda a evitar críticos y estados alterados.', 'Raises Luck for the whole party. Helps avoid criticals and ailments.'),

  skill({ id: 'pass', row: 'combat', nameEs: 'Relevo vistoso', nameEn: 'Pass Appeal', descEs: 'Al hacer un relevo, la barra de Showtime se llena más rápido.', descEn: 'Baton Passes fill the Showtime gauge faster.', costs: [3, 5, 10], ...STORY_0727 }),
  skill({ id: 'harisen', row: 'combat', nameEs: 'Ayuda con harisen', nameEn: 'Harisen Helper', descEs: 'Sube la probabilidad de que un compañero te cure un estado alterado con el harisen.', descEn: 'Raises the chance that a teammate cures your ailment with Harisen Recovery.', costs: [3, 5, 10], ...STORY_0727 }),
  skill({ id: 'oracle', row: 'combat', nameEs: 'Recuperación de Oracle', nameEn: 'Oracle Recovery', descEs: 'Recupera PS y PE de todo el equipo al terminar cada batalla.', descEn: 'Restores HP and SP to the whole party after each battle.', costs: [15, 20, 25], ...STORY_0727 }),
  skill({ id: 'martial', row: 'combat', nameEs: 'Artes marciales', nameEn: 'Martial Arts', descEs: 'Aumenta el daño de las habilidades físicas de Persona.', descEn: 'Boosts damage of physical Persona skills.', costs: [2, 4, 6, 8, 10], ...STORY_0801 }),
  skill({ id: 'spiritual', row: 'combat', nameEs: 'Artes espirituales', nameEn: 'Spiritual Arts', descEs: 'Aumenta el daño de las habilidades mágicas de Persona.', descEn: 'Boosts damage of magic Persona skills.', costs: [2, 4, 6, 8, 10], ...STORY_0801 }),
  skill({ id: 'tactical', row: 'combat', nameEs: 'Artes tácticas', nameEn: 'Tactical Arts', descEs: 'Sube la probabilidad de que las habilidades de Persona provoquen estados alterados.', descEn: 'Raises the chance of Persona skills inflicting ailments.', costs: [2, 4, 6, 8, 10], ...STORY_0801 }),
  skill({ id: 'supportive', row: 'combat', nameEs: 'Artes de apoyo', nameEn: 'Supportive Arts', official: true, descEs: 'Aumenta la duración de los potenciadores y las debilitaciones de las habilidades de Persona.', descEn: 'Extends buffs and debuffs from Persona skills.', costs: [2, 4, 6, 8, 10], perLevelEs: 'Duración del efecto +', perLevelEn: 'Effect duration +', ...STORY_0801 }),

  skill({ id: 'jokers-wild', row: 'style', nameEs: 'Comodín de Joker', nameEn: "Joker's Wild", descEs: 'Sube la probabilidad de que aparezcan máscaras.', descEn: 'Raises the chance of masks appearing.', costs: [], maxLevel: 10, total: 40, ...STORY_0727 }),
  skill({ id: 'ambusher', row: 'style', nameEs: 'Emboscador', nameEn: 'Ambusher', descEs: 'Recupera PS de todo el equipo al emboscar con éxito.', descEn: 'Restores HP to the whole party after a successful ambush.', costs: [5, 10, 15], unlockEs: 'Emboscar en el Cruce de la Cárcel de Shibuya (27/7)', unlockEn: 'Ambush in Crossing, Shibuya Jail (7/27)' }),
  skill({ id: 'phantom', row: 'style', nameEs: 'Golpe fantasma', nameEn: 'Phantom Striker', descEs: 'Aumenta el daño del Phantom Dash.', descEn: 'Boosts Phantom Dash damage.', costs: [3, 5, 10], unlockEs: 'Vencer al monarca de la Cárcel de Shibuya (29/7)', unlockEn: 'Defeat the Shibuya Jail Monarch (7/29)' }),
  skill({ id: 'avenger', row: 'style', nameEs: 'Vengador', nameEn: 'Avenger', descEs: 'Al esquivar un ataque podés contraatacar con más fuerza.', descEn: 'Evading an attack can trigger a stronger counterattack.', costs: [5, 10, 15], unlockEs: 'Vencer al monarca de la Cárcel de Sendai (4/8)', unlockEn: 'Defeat the Sendai Jail Monarch (8/4)' }),
  skill({ id: 'ammo', row: 'style', nameEs: 'Acaparador de munición', nameEn: 'Ammo Hoarder', descEs: 'Aumenta las balas de todo el equipo, según el tipo de arma.', descEn: "Raises every member's ammo, depending on gun type.", costs: [5, 10, 15], unlockEs: 'Vencer al monarca de la Cárcel de Sapporo (12/8)', unlockEn: 'Defeat the Sapporo Jail Monarch (8/12)' }),
  skill({ id: 'showman', row: 'style', nameEs: 'Gran showman', nameEn: 'Proper Showman', descEs: 'Aumenta el daño de los ataques Showtime.', descEn: 'Boosts Showtime damage.', costs: [5, 10, 15], unlockEs: 'Vencer al guardián de la Cárcel de Okinawa (17/8)', unlockEn: 'Defeat the Okinawa Jail Lock Keeper (8/17)' }),
  skill({ id: 'spirit', row: 'style', nameEs: 'Golpe espiritual', nameEn: 'Spirit Striker', descEs: 'Un «1 More» recupera PE de quien ataca, y un Ataque Total recupera PE de todo el equipo.', descEn: '1 More restores the attacker’s SP; All-Out Attacks restore the party’s SP.', costs: [15, 20, 25], unlockEs: 'Vencer al monarca de la Cárcel de Osaka (26/8)', unlockEn: 'Defeat the Osaka Jail Monarch (8/26)' }),

  skill({ id: 'shopper', row: 'perks', nameEs: 'Comprador astuto', nameEn: 'Smart Shopper', descEs: 'Más productos y ofertas en la tienda de Sophia.', descEn: "More items and sales at Sophia's shop.", costs: [2, 4, 10], ...STORY_0727 }),
  skill({ id: 'medic', row: 'perks', nameEs: 'Médico del Metaverso', nameEn: 'Metaverse Medic', descEs: 'Aumenta el efecto de los objetos de curación.', descEn: 'Boosts healing items.', costs: [2, 4, 10], ...STORY_0727 }),
  skill({ id: 'bondmaker', row: 'perks', nameEs: 'Forjador de vínculos', nameEn: 'Bondmaker', descEs: 'El nivel de VÍNCULO sube más rápido (hasta ×1,25 al máximo).', descEn: 'BOND level rises faster (up to ×1.25 at max).', costs: [2, 4, 6, 8, 10], ...STORY_0727 }),
  skill({ id: 'highwayman', row: 'perks', nameEs: 'Salteador', nameEn: 'Highwayman', descEs: 'Sube la probabilidad de conseguir objetos al terminar la batalla.', descEn: 'Raises the chance of items after battle.', costs: [3, 5, 10], ...STORY_0727 }),
  skill({ id: 'extortionist', row: 'perks', nameEs: 'Extorsionador', nameEn: 'Extortionist', descEs: 'Ganás más dinero al terminar la batalla.', descEn: 'More money after battle.', costs: [2, 4, 6, 8, 10], ...STORY_0727 }),

  skill({ id: 'safecracker', row: 'explore', nameEs: 'Revientacajas', nameEn: 'Safecracker', descEs: 'Permite abrir cofres más difíciles.', descEn: 'Lets you open tougher chests.', costs: [2, 3, 5], unlockEs: 'Encontrar el cofre de nivel 1 en Bunkamachi, Cárcel de Shibuya (27/7)', unlockEn: 'Find the Lv 1 chest in Bunkamachi, Shibuya Jail (7/27)' }),
  skill({ id: 'chef', row: 'explore', nameEs: 'Chef maestro', nameEn: 'Master Chef', descEs: 'Permite cocinar más platos y con mejores efectos.', descEn: 'Lets you cook more dishes with stronger effects.', costs: [2, 3, 4, 5], unlockEs: 'Historia (31/7)', unlockEn: 'Story (7/31)' }),
  skill({ id: 'treasure', row: 'explore', nameEs: 'Cazatesoros', nameEn: 'Treasure Hunter', descEs: 'Sube la probabilidad de cruzarte con demonios del tesoro: enemigos que dan más objetos.', descEn: 'Raises the chance of meeting Treasure Demons: enemies that drop more items.', costs: [2, 4, 8], unlockEs: 'Acercarte a un demonio del tesoro en el Jardín Oeste, Cárcel de Sendai (2/8)', unlockEn: 'Approach a Treasure Demon in West Garden, Sendai Jail (8/2)' }),
  skill({ id: 'packrat', row: 'explore', nameEs: 'Acumulador', nameEn: 'Packrat', descEs: 'Las piezas de chatarra son más fáciles de conseguir.', descEn: 'Junk parts are easier to get.', costs: [2, 4, 8], unlockEs: 'Historia (7/8)', unlockEn: 'Story (8/7)' }),
];

export const BOND_ROWS: { id: BondRow; es: string; en: string }[] = [
  { id: 'stats', es: 'Estadísticas', en: 'Stats' },
  { id: 'combat', es: 'Combate', en: 'Combat' },
  { id: 'style', es: 'Estilo de pelea', en: 'Fighting style' },
  { id: 'perks', es: 'Ventajas', en: 'Perks' },
  { id: 'explore', es: 'Exploración', en: 'Exploration' },
];
