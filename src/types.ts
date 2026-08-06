export const PURPOSE_PRESETS: string[] = [
  'Nákup materiálu na sklad',
  'Nákup materiálu na režii',
  'Závoz materiálu na stavbu',
  'Svoz materiálu',
  'Svoz odpadu ze stavby',
  'Reklamace / servis',
  'Mimořádná jízda',
];

export interface Site {
  id: string;
  number: string; // Číslo stavby (např. 104/2026 nebo 52)
  name: string; // Název stavby (např. Bytový dům Parková)
  owner: string; // Vlastník stavby (např. Skanska a.s. / Ing. Novák)
  phone: string; // Telefonní číslo vlastníka / hlavního kontaktu
  siteManager?: string; // Stavbyvedoucí (např. Ing. Pavel Novák)
  siteManagerPhone?: string; // Telefon na stavbyvedoucího
  contactPerson?: string; // Kontaktní osoba na stavbě (komu se předává materiál)
  contactPhone?: string; // Telefon na kontaktní osobu na stavbě
  carnetSmsOverride?: string; // Volitelné vlastní Carnet SMS (jinak se generuje SPZ;čísloStavby;)
  notes?: string; // Doplňující poznámka ke stavbě
  createdAt: string;
}

export interface FirmContact {
  id: string;
  name: string; // Jméno a příjmení (např. Jan Novák - Obchodní zástupce)
  phone: string; // Telefonní číslo
  role?: string; // Volitelná pozice / oddělení
}

export interface SupplierFirm {
  id: string;
  name: string; // Název firmy (např. DEK Stavebniny, Hornbach, Elektro-Material)
  color: string; // Označovací barva firmy (hex, např. #ef4444)
  address?: string; // Adresa / Pobočka
  mapUrl?: string; // Odkaz na Mapy.cz / Google Maps pro okamžité zobrazení na mapě
  phone?: string; // Hlavní telefon / Recepce
  email?: string; // Nepovinný e-mail
  contacts?: FirmContact[]; // Více telefonních kontaktů / osob
  notes?: string;
  createdAt: string;
}

export interface Trip {
  id: string;
  startTime: string; // ISO čas zahájení jízdy ze systému
  endTime?: string; // ISO čas ukončení jízdy
  siteId: string;
  siteNumber: string;
  siteName: string;
  siteOwner?: string;
  sitePhone?: string; // Telefon vlastníka stavby
  siteManager?: string; // Stavbyvedoucí
  siteManagerPhone?: string; // Telefon stavbyvedoucího
  siteContactPerson?: string; // Kontaktní osoba na stavbě pro předání materiálu
  siteContactPhone?: string; // Telefon na kontaktní osobu na stavbě
  firmId?: string;
  firmIds?: string[];
  firmName?: string;
  firmNames?: string[];
  firmColor?: string;
  firmPhone?: string; // Telefon dodavatelské firmy
  vehiclePlate: string; // SPZ (např. 6AH 5297)
  carnetText: string; // Přesný text Carnet SMS který byl zkopírován (např. "6AH 5297;104/2026;")
  carnetCopiedAt: string; // Čas zkopírování Carnet SMS
  content: string; // Obsah jízdy (text s možností středníku ; pro nová zalomení)
  startKm?: number; // Počáteční stav tachometru
  endKm?: number; // Konečný stav tachometru
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface OPItem {
  id: string;
  name: string; // Název položky (např. Sádrokarton RB 12.5mm)
  quantity?: number; // Množství
  unit?: string; // Jednotka (ks, m2, bm, kg, bal)
  note?: string; // Poznámka k položce
}

export interface OPRecord {
  id: string;
  opNumber: string; // Číslo OP (např. OP-2026/045)
  title?: string; // Název objednávky / popis dodávky
  supplierName?: string; // Dodavatel
  siteNumber?: string; // Stavba
  items?: OPItem[]; // Vypsané položky ručně
  documentDataUrl?: string; // Nahraný dokument / sken (Base64 data url / image / PDF)
  documentFileName?: string; // Název nahraného souboru
  documentFileType?: string; // Typ souboru (image/png, application/pdf, etc.)
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  defaultPlate: string; // Standardní SPZ vozidla (default: "6AH 5297")
  driverName?: string; // Jméno řidiče (volitelné)
  autoClearCarnetAfterMinutes?: number;
}
