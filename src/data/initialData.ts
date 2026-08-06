import { Site, SupplierFirm, AppSettings, Trip, OPRecord } from '../types';

export interface SiteDataInitial {
  // initial site objects
}

export const DEFAULT_SETTINGS: AppSettings = {
  defaultPlate: '6AH 5297',
  driverName: 'Jan Novotný',
};

export const INITIAL_SITES: Site[] = [
  {
    id: 'site-1',
    number: '104/2026',
    name: 'Rezidence Botanica - Blok A',
    owner: 'Metrostav Development a.s.',
    phone: '+420 602 123 456',
    siteManager: 'Ing. Pavel Novák',
    siteManagerPhone: '+420 603 999 111',
    contactPerson: 'Mistr Jan Procházka (Předání materiálu)',
    contactPhone: '+420 777 104 206',
    notes: 'Vjezd z ulice Radlická, brána č. 2',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'site-2',
    number: '215/2026',
    name: 'Rekonstrukce ZŠ Nerudova',
    owner: 'Městská část Praha 5',
    phone: '+420 257 000 111',
    siteManager: 'Stavbyvedoucí Tomáš Dvořák',
    siteManagerPhone: '+420 777 444 333',
    contactPerson: 'Karel Dvořák (Technický dozor stavby)',
    contactPhone: '+420 777 888 999',
    notes: 'Stavba probíhá za provozu, parkovat na dvoře',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'site-3',
    number: '089/2026',
    name: 'Logistické Centrum Cargo II',
    owner: 'Panattoni Europe CZ',
    phone: '+420 222 555 000',
    siteManager: 'Stavbyvedoucí Ing. Marek Černý',
    siteManagerPhone: '+420 602 555 777',
    contactPerson: 'Dispečink přejímky zboží',
    contactPhone: '+420 731 555 111',
    notes: 'Vždy nutná přilba a reflexní vesty',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'site-4',
    number: '430/2026',
    name: 'Rodinné Domy Chynice',
    owner: 'Soukromý investor - MUDr. Svoboda',
    phone: '+420 608 222 333',
    siteManager: 'Stavbyvedoucí Martin Vlk',
    siteManagerPhone: '+420 608 999 888',
    contactPerson: 'Radek Kučera (Montážní tým)',
    contactPhone: '+420 722 111 444',
    notes: 'Klíče od brány u souseda č.p. 45',
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_FIRMS: SupplierFirm[] = [
  {
    id: 'firm-1',
    name: 'DEK Stavebniny - Praha Zličín',
    color: '#ef4444', // Red
    address: 'Vysočanská 55, Praha',
    phone: '+420 510 000 111',
    email: 'zlicin@dek.cz',
    contacts: [
      { id: 'c1-1', name: 'Karel Novotný (Obchodní zástupce)', phone: '+420 602 111 222' },
      { id: 'c1-2', name: 'Jiří Svoboda (Vedoucí skladu)', phone: '+420 777 333 444' },
    ],
    notes: 'Výdej stavebního materiálu a sádrokartonů',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'firm-2',
    name: 'Elektro-Material & Kabeláž',
    color: '#3b82f6', // Blue
    address: 'Průmyslová 12, Praha 10',
    phone: '+420 222 333 444',
    email: 'objednavky@elektromaterial.cz',
    contacts: [
      { id: 'c2-1', name: 'Martin Kučera (Dispečink výdeje)', phone: '+420 608 555 666' },
    ],
    notes: 'Rychlé vydání na jméno firmy',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'firm-3',
    name: 'Hornbach Remeslnická Prodejna',
    color: '#f59e0b', // Amber/Orange
    address: 'Chlumecká 2398, Praha 9',
    phone: '+420 800 111 222',
    email: 'profi-praha9@hornbach.cz',
    contacts: [
      { id: 'c3-1', name: 'Profi-Desk Přepážka', phone: '+420 220 111 999' },
      { id: 'c3-2', name: 'Pavel Dvořák (Obchodník pro stavby)', phone: '+420 724 888 777' },
    ],
    notes: 'Příjezd pro dodávku z boku u Drive-in',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'firm-4',
    name: 'Vodoinstalace & Topení Horák',
    color: '#10b981', // Emerald
    address: 'Kollárova 8, Beroun',
    phone: '+420 724 999 000',
    email: 'horak@voda-topeni.cz',
    contacts: [
      { id: 'c4-1', name: 'Václav Horák (Majitel / Sklad)', phone: '+420 724 999 001' },
    ],
    notes: 'Otevřeno od 6:30 hod',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'firm-5',
    name: 'Würth Spojovací Materiál',
    color: '#8b5cf6', // Purple
    address: 'K Hájům 2, Praha 5',
    phone: '+420 234 000 555',
    email: 'info@wurth.cz',
    contacts: [
      { id: 'c5-1', name: 'Ondřej Beneš (Zástupce pro region)', phone: '+420 603 444 888' },
    ],
    notes: 'Spojovací materiál a nářadí',
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_OP_RECORDS: OPRecord[] = [
  {
    id: 'op-rec-1',
    opNumber: 'OP-2026/045',
    title: 'Objednávka sádrokartonů a profilů DEK Zličín',
    supplierName: 'DEK Stavebniny - Praha Zličín',
    siteNumber: '104/2026',
    items: [
      { id: 'item-1', name: 'Sádrokartonová deska Knauf GKB 12,5mm (1200x2000)', quantity: 40, unit: 'ks', note: 'Paleta č. 1' },
      { id: 'item-2', name: 'Profil stropní CD 60 délka 3m', quantity: 60, unit: 'ks', note: 'Svazek 10ks' },
      { id: 'item-3', name: 'Samorezné šrouby do plechu TN 25mm (1000ks)', quantity: 2, unit: 'bal', note: 'Krabice' },
      { id: 'item-4', name: 'Spárovací tmel Knauf Uniflott 5kg', quantity: 4, unit: 'ks', note: 'Pytel' },
    ],
    notes: 'Vyzvednutí na jméno stavby 104/2026 Rezidence Botanica. Zaplaceno zálohou.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'op-rec-2',
    opNumber: 'OP-2026/088',
    title: 'Objednávka elektroinstalace a rozvaděče',
    supplierName: 'Elektro-Material',
    siteNumber: '52',
    items: [
      { id: 'item-201', name: 'Kabel CYKY-J 3x2.5 100m', quantity: 2, unit: 'bal', note: 'Buben' },
      { id: 'item-202', name: 'Jistič Eaton 1-pólový 16A B', quantity: 12, unit: 'ks', note: 'Pro podružný rozvaděč' },
      { id: 'item-203', name: 'Krabice přístrojová KU 68 pod omítku', quantity: 50, unit: 'ks', note: 'Balík' },
    ],
    notes: 'Vydá dispečink výdeje Pan Kučera',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

export const DEMO_TRIPS: Trip[] = [
  {
    id: 'trip-demo-1',
    startTime: new Date(Date.now() - 86400000 * 1.5).toISOString(),
    endTime: new Date(Date.now() - 86400000 * 1.5 + 4500000).toISOString(),
    siteId: 'site-1',
    siteNumber: '104/2026',
    siteName: 'Rezidence Botanica - Blok A',
    siteOwner: 'Metrostav Development a.s.',
    sitePhone: '+420 602 123 456',
    siteManager: 'Ing. Pavel Novák',
    siteManagerPhone: '+420 603 999 111',
    siteContactPerson: 'Mistr Jan Procházka (Předání materiálu)',
    siteContactPhone: '+420 777 104 206',
    firmId: 'firm-1',
    firmName: 'DEK Stavebniny - Praha Zličín',
    firmColor: '#ef4444',
    firmPhone: '+420 510 000 111',
    vehiclePlate: '6AH 5297',
    carnetText: '6AH 5297;104/2026;',
    carnetCopiedAt: new Date(Date.now() - 86400000 * 1.5).toISOString(),
    content: 'Vyzvednutí sádrokartonových desek dle OP-2026/045;Doprava na stavbu blok A;Předání panu Procházkovi',
    startKm: 142350,
    endKm: 142385,
    status: 'completed',
    createdAt: new Date(Date.now() - 86400000 * 1.5).toISOString(),
  },
];
