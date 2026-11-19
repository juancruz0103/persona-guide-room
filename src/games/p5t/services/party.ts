import partyJson from '../data/generated/party.json';
import type { Member, Text } from '../types';
import { L } from '../../../i18n';

const PARTY = partyJson as unknown as Member[];
export const getParty = (): Member[] => PARTY;
export const getMember = (id: string) => PARTY.find((m) => m.id === id);
/** Texto en el idioma actual, con el otro como respaldo. */
export const tx = (t: Text | null | undefined) => (t ? L(t.es ?? t.en ?? '', t.en ?? t.es ?? '') : '');
