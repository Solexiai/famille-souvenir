import { TerminologyPack, JurisdictionPack } from './types';

const quebec: TerminologyPack = {
  executor: 'liquidateur',
  will: 'testament',
  mandate: 'mandat de protection',
  notary: 'notaire',
  estate: 'succession',
  beneficiary: 'bénéficiaire',
  dossier: 'dossier',
  trust: 'fiducie',
  probate: 'vérification',
  power_of_attorney: 'procuration',
};

const canada_general: TerminologyPack = {
  executor: 'executor',
  will: 'will',
  mandate: 'power of attorney',
  notary: 'notary',
  estate: 'estate',
  beneficiary: 'beneficiary',
  dossier: 'dossier',
  trust: 'trust',
  probate: 'probate',
  power_of_attorney: 'power of attorney',
};

const us_general: TerminologyPack = {
  executor: 'executor',
  will: 'will',
  mandate: 'power of attorney',
  notary: 'notary public',
  estate: 'estate',
  beneficiary: 'beneficiary',
  dossier: 'dossier',
  trust: 'trust',
  probate: 'probate',
  power_of_attorney: 'power of attorney',
};

const latam_general: TerminologyPack = {
  executor: 'albacea',
  will: 'testamento',
  mandate: 'poder notarial',
  notary: 'notario',
  estate: 'sucesión',
  beneficiary: 'beneficiario',
  dossier: 'expediente',
  trust: 'fideicomiso',
  probate: 'juicio sucesorio',
  power_of_attorney: 'poder notarial',
};

const packs: Record<JurisdictionPack, TerminologyPack> = {
  quebec,
  canada_general,
  us_general,
  latam_general,
};

export function getTerminology(pack: JurisdictionPack | string | null | undefined): TerminologyPack {
  return packs[(pack as JurisdictionPack)] ?? canada_general;
}

export default packs;
