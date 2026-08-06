import { Site, SupplierFirm, Trip, AppSettings, OPRecord } from '../types';
import { INITIAL_SITES, INITIAL_FIRMS, DEFAULT_SETTINGS, DEMO_TRIPS, INITIAL_OP_RECORDS } from '../data/initialData';

const STORAGE_KEYS = {
  SITES: 'van_log_sites_v1',
  FIRMS: 'van_log_firms_v1',
  TRIPS: 'van_log_trips_v1',
  SETTINGS: 'van_log_settings_v1',
  ACTIVE_TRIP: 'van_log_active_trip_v1',
  OP_RECORDS: 'van_log_op_records_v1',
};

export const loadSites = (): Site[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SITES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SITES, JSON.stringify(INITIAL_SITES));
      return INITIAL_SITES;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load sites', err);
    return INITIAL_SITES;
  }
};

export const saveSites = (sites: Site[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SITES, JSON.stringify(sites));
    fetch('/api/sites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sites }),
    }).catch((err) => console.warn('Failed to sync sites to SQLite backend', err));
  } catch (err) {
    console.error('Failed to save sites', err);
  }
};

export const loadFirms = (): SupplierFirm[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FIRMS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.FIRMS, JSON.stringify(INITIAL_FIRMS));
      return INITIAL_FIRMS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load firms', err);
    return INITIAL_FIRMS;
  }
};

export const saveFirms = (firms: SupplierFirm[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.FIRMS, JSON.stringify(firms));
    fetch('/api/firms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firms }),
    }).catch((err) => console.warn('Failed to sync firms to SQLite backend', err));
  } catch (err) {
    console.error('Failed to save firms', err);
  }
};

export const loadTrips = (): Trip[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRIPS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(DEMO_TRIPS));
      return DEMO_TRIPS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load trips', err);
    return DEMO_TRIPS;
  }
};

export const saveTrips = (trips: Trip[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));
    fetch('/api/trips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trips }),
    }).catch((err) => console.warn('Failed to sync trips to SQLite backend', err));
  } catch (err) {
    console.error('Failed to save trips', err);
  }
};

export const loadSettings = (): AppSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    return JSON.parse(raw);
  } catch (err) {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (settings: AppSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings }),
    }).catch((err) => console.warn('Failed to sync settings to SQLite backend', err));
  } catch (err) {
    console.error('Failed to save settings', err);
  }
};

export const loadOPRecords = (): OPRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.OP_RECORDS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.OP_RECORDS, JSON.stringify(INITIAL_OP_RECORDS));
      return INITIAL_OP_RECORDS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load OP records', err);
    return INITIAL_OP_RECORDS;
  }
};

export const saveOPRecords = (records: OPRecord[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.OP_RECORDS, JSON.stringify(records));
    fetch('/api/op-records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ records }),
    }).catch((err) => console.warn('Failed to sync OP records to SQLite backend', err));
  } catch (err) {
    console.error('Failed to save OP records', err);
  }
};

export const fetchSqliteData = async (): Promise<{
  sites?: Site[];
  firms?: SupplierFirm[];
  trips?: Trip[];
  opRecords?: OPRecord[];
  settings?: AppSettings;
} | null> => {
  try {
    const res = await fetch('/api/data');
    if (!res.ok) return null;
    const data = await res.json();
    if (data.sites) {
      localStorage.setItem(STORAGE_KEYS.SITES, JSON.stringify(data.sites));
    }
    if (data.firms) {
      localStorage.setItem(STORAGE_KEYS.FIRMS, JSON.stringify(data.firms));
    }
    if (data.trips) {
      localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(data.trips));
    }
    if (data.opRecords) {
      localStorage.setItem(STORAGE_KEYS.OP_RECORDS, JSON.stringify(data.opRecords));
    }
    if (data.settings) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
    }
    return data;
  } catch (err) {
    console.warn('Could not fetch from SQLite backend (using offline/local cache)', err);
    return null;
  }
};

export const formatCarnetSms = (spz: string, siteNumber: string): string => {
  const cleanSpz = spz ? spz.trim() : '6AH 5297';
  const cleanSiteNum = siteNumber ? siteNumber.trim() : '';
  return `${cleanSpz};${cleanSiteNum};`;
};

// Format site number with space digit grouping every 3 digits (e.g. 250000069 -> 250 000 069)
export const formatSiteNumber = (numStr: string | undefined | null): string => {
  if (!numStr) return '';
  const cleaned = numStr.trim();
  // If string contains sequence of digits without spaces (or formatted), group digits in sets of 3 from right
  return cleaned.replace(/\s+/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

// Clipboard copy helper with browser fallbacks
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) {
    console.warn('Navigator clipboard write failed, using fallback', e);
  }

  // Fallback for iframe / strict browser security
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Fallback copy failed', err);
    return false;
  }
};
