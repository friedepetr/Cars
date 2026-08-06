import express from 'express';
import path from 'path';
import fs from 'fs';
import initSqlJs, { Database } from 'sql.js';
import { createServer as createViteServer } from 'vite';

import {
  INITIAL_SITES,
  INITIAL_FIRMS,
  DEFAULT_SETTINGS,
  DEMO_TRIPS,
  INITIAL_OP_RECORDS,
} from './src/data/initialData';

const PORT = 3000;
const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'app.sqlite');

let db: Database;

async function saveDbToDisk() {
  if (!db) return;
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE, buffer);
  } catch (err) {
    console.error('Failed to save SQLite database to disk:', err);
  }
}

async function initDatabase() {
  const SQL = await initSqlJs();

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const fileBuffer = fs.readFileSync(DB_FILE);
      db = new SQL.Database(fileBuffer);
      console.log('Successfully loaded existing SQLite database from:', DB_FILE);
    } catch (err) {
      console.error('Error reading existing SQLite DB file, creating fresh DB:', err);
      db = new SQL.Database();
    }
  } else {
    console.log('No existing SQLite file found, creating new database at:', DB_FILE);
    db = new SQL.Database();
  }

  // Create tables if they do not exist
  db.run(`
    CREATE TABLE IF NOT EXISTS sites (
      id TEXT PRIMARY KEY,
      number TEXT,
      name TEXT,
      owner TEXT,
      phone TEXT,
      siteManager TEXT,
      siteManagerPhone TEXT,
      contactPerson TEXT,
      contactPhone TEXT,
      carnetSmsOverride TEXT,
      notes TEXT,
      createdAt TEXT
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS supplier_firms (
      id TEXT PRIMARY KEY,
      name TEXT,
      color TEXT,
      address TEXT,
      mapUrl TEXT,
      phone TEXT,
      email TEXT,
      contactsJson TEXT,
      notes TEXT,
      createdAt TEXT
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS trips (
      id TEXT PRIMARY KEY,
      startTime TEXT,
      endTime TEXT,
      siteId TEXT,
      siteNumber TEXT,
      siteName TEXT,
      siteOwner TEXT,
      sitePhone TEXT,
      siteManager TEXT,
      siteManagerPhone TEXT,
      siteContactPerson TEXT,
      siteContactPhone TEXT,
      firmId TEXT,
      firmIdsJson TEXT,
      firmName TEXT,
      firmNamesJson TEXT,
      firmColor TEXT,
      firmPhone TEXT,
      vehiclePlate TEXT,
      carnetText TEXT,
      carnetCopiedAt TEXT,
      content TEXT,
      startKm INTEGER,
      endKm INTEGER,
      status TEXT,
      createdAt TEXT
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS op_records (
      id TEXT PRIMARY KEY,
      opNumber TEXT,
      title TEXT,
      supplierName TEXT,
      siteNumber TEXT,
      itemsJson TEXT,
      documentDataUrl TEXT,
      documentFileName TEXT,
      documentFileType TEXT,
      notes TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      valueJson TEXT
    );
  `);

  // Seed default data if tables are empty
  const sitesCountResult = db.exec('SELECT COUNT(*) as count FROM sites');
  const sitesCount = sitesCountResult[0]?.values[0]?.[0] as number || 0;

  if (sitesCount === 0) {
    console.log('Seeding initial sites into SQLite...');
    for (const site of INITIAL_SITES) {
      db.run(
        `INSERT INTO sites (id, number, name, owner, phone, siteManager, siteManagerPhone, contactPerson, contactPhone, carnetSmsOverride, notes, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          site.id,
          site.number || '',
          site.name || '',
          site.owner || '',
          site.phone || '',
          site.siteManager || '',
          site.siteManagerPhone || '',
          site.contactPerson || '',
          site.contactPhone || '',
          site.carnetSmsOverride || '',
          site.notes || '',
          site.createdAt || new Date().toISOString(),
        ]
      );
    }
  }

  const firmsCountResult = db.exec('SELECT COUNT(*) as count FROM supplier_firms');
  const firmsCount = firmsCountResult[0]?.values[0]?.[0] as number || 0;

  if (firmsCount === 0) {
    console.log('Seeding initial supplier firms into SQLite...');
    for (const firm of INITIAL_FIRMS) {
      db.run(
        `INSERT INTO supplier_firms (id, name, color, address, mapUrl, phone, email, contactsJson, notes, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          firm.id,
          firm.name || '',
          firm.color || '#3b82f6',
          firm.address || '',
          firm.mapUrl || '',
          firm.phone || '',
          firm.email || '',
          JSON.stringify(firm.contacts || []),
          firm.notes || '',
          firm.createdAt || new Date().toISOString(),
        ]
      );
    }
  }

  const tripsCountResult = db.exec('SELECT COUNT(*) as count FROM trips');
  const tripsCount = tripsCountResult[0]?.values[0]?.[0] as number || 0;

  if (tripsCount === 0) {
    console.log('Seeding demo trips into SQLite...');
    for (const trip of DEMO_TRIPS) {
      db.run(
        `INSERT INTO trips (id, startTime, endTime, siteId, siteNumber, siteName, siteOwner, sitePhone, siteManager, siteManagerPhone, siteContactPerson, siteContactPhone, firmId, firmIdsJson, firmName, firmNamesJson, firmColor, firmPhone, vehiclePlate, carnetText, carnetCopiedAt, content, startKm, endKm, status, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          trip.id,
          trip.startTime || '',
          trip.endTime || '',
          trip.siteId || '',
          trip.siteNumber || '',
          trip.siteName || '',
          trip.siteOwner || '',
          trip.sitePhone || '',
          trip.siteManager || '',
          trip.siteManagerPhone || '',
          trip.siteContactPerson || '',
          trip.siteContactPhone || '',
          trip.firmId || '',
          JSON.stringify(trip.firmIds || []),
          trip.firmName || '',
          JSON.stringify(trip.firmNames || []),
          trip.firmColor || '',
          trip.firmPhone || '',
          trip.vehiclePlate || '6AH 5297',
          trip.carnetText || '',
          trip.carnetCopiedAt || '',
          trip.content || '',
          trip.startKm ?? null,
          trip.endKm ?? null,
          trip.status || 'completed',
          trip.createdAt || new Date().toISOString(),
        ]
      );
    }
  }

  const opCountResult = db.exec('SELECT COUNT(*) as count FROM op_records');
  const opCount = opCountResult[0]?.values[0]?.[0] as number || 0;

  if (opCount === 0) {
    console.log('Seeding OP records into SQLite...');
    for (const op of INITIAL_OP_RECORDS) {
      db.run(
        `INSERT INTO op_records (id, opNumber, title, supplierName, siteNumber, itemsJson, documentDataUrl, documentFileName, documentFileType, notes, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          op.id,
          op.opNumber || '',
          op.title || '',
          op.supplierName || '',
          op.siteNumber || '',
          JSON.stringify(op.items || []),
          op.documentDataUrl || '',
          op.documentFileName || '',
          op.documentFileType || '',
          op.notes || '',
          op.createdAt || new Date().toISOString(),
          op.updatedAt || new Date().toISOString(),
        ]
      );
    }
  }

  const settingsResult = db.exec("SELECT valueJson FROM app_settings WHERE key = 'app_settings'");
  if (settingsResult.length === 0 || settingsResult[0].values.length === 0) {
    db.run("INSERT INTO app_settings (key, valueJson) VALUES ('app_settings', ?)", [
      JSON.stringify(DEFAULT_SETTINGS),
    ]);
  }

  await saveDbToDisk();
}

function getSitesFromDb() {
  const stmt = db.prepare('SELECT * FROM sites');
  const sites = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    sites.push({
      id: row.id as string,
      number: row.number as string,
      name: row.name as string,
      owner: row.owner as string,
      phone: row.phone as string,
      siteManager: row.siteManager as string,
      siteManagerPhone: row.siteManagerPhone as string,
      contactPerson: row.contactPerson as string,
      contactPhone: row.contactPhone as string,
      carnetSmsOverride: row.carnetSmsOverride as string,
      notes: row.notes as string,
      createdAt: row.createdAt as string,
    });
  }
  stmt.free();
  return sites;
}

function getFirmsFromDb() {
  const stmt = db.prepare('SELECT * FROM supplier_firms');
  const firms = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    let contacts = [];
    try {
      contacts = JSON.parse((row.contactsJson as string) || '[]');
    } catch (e) {
      contacts = [];
    }
    firms.push({
      id: row.id as string,
      name: row.name as string,
      color: row.color as string,
      address: row.address as string,
      mapUrl: row.mapUrl as string,
      phone: row.phone as string,
      email: row.email as string,
      contacts,
      notes: row.notes as string,
      createdAt: row.createdAt as string,
    });
  }
  stmt.free();
  return firms;
}

function getTripsFromDb() {
  const stmt = db.prepare('SELECT * FROM trips ORDER BY createdAt DESC');
  const trips = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    let firmIds = [];
    let firmNames = [];
    try {
      firmIds = JSON.parse((row.firmIdsJson as string) || '[]');
    } catch (e) {}
    try {
      firmNames = JSON.parse((row.firmNamesJson as string) || '[]');
    } catch (e) {}

    trips.push({
      id: row.id as string,
      startTime: row.startTime as string,
      endTime: row.endTime as string,
      siteId: row.siteId as string,
      siteNumber: row.siteNumber as string,
      siteName: row.siteName as string,
      siteOwner: row.siteOwner as string,
      sitePhone: row.sitePhone as string,
      siteManager: row.siteManager as string,
      siteManagerPhone: row.siteManagerPhone as string,
      siteContactPerson: row.siteContactPerson as string,
      siteContactPhone: row.siteContactPhone as string,
      firmId: row.firmId as string,
      firmIds,
      firmName: row.firmName as string,
      firmNames,
      firmColor: row.firmColor as string,
      firmPhone: row.firmPhone as string,
      vehiclePlate: row.vehiclePlate as string,
      carnetText: row.carnetText as string,
      carnetCopiedAt: row.carnetCopiedAt as string,
      content: row.content as string,
      startKm: row.startKm !== null ? Number(row.startKm) : undefined,
      endKm: row.endKm !== null ? Number(row.endKm) : undefined,
      status: row.status as 'active' | 'completed' | 'cancelled',
      createdAt: row.createdAt as string,
    });
  }
  stmt.free();
  return trips;
}

function getOpRecordsFromDb() {
  const stmt = db.prepare('SELECT * FROM op_records ORDER BY createdAt DESC');
  const records = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    let items = [];
    try {
      items = JSON.parse((row.itemsJson as string) || '[]');
    } catch (e) {}

    records.push({
      id: row.id as string,
      opNumber: row.opNumber as string,
      title: row.title as string,
      supplierName: row.supplierName as string,
      siteNumber: row.siteNumber as string,
      items,
      documentDataUrl: row.documentDataUrl as string,
      documentFileName: row.documentFileName as string,
      documentFileType: row.documentFileType as string,
      notes: row.notes as string,
      createdAt: row.createdAt as string,
      updatedAt: row.updatedAt as string,
    });
  }
  stmt.free();
  return records;
}

function getSettingsFromDb() {
  const result = db.exec("SELECT valueJson FROM app_settings WHERE key = 'app_settings'");
  if (result.length > 0 && result[0].values.length > 0) {
    try {
      return JSON.parse(result[0].values[0][0] as string);
    } catch (e) {}
  }
  return DEFAULT_SETTINGS;
}

async function startServer() {
  await initDatabase();

  const app = express();
  app.use(express.json({ limit: '50mb' }));

  // API Endpoints for SQLite Persistence
  app.get('/api/data', (req, res) => {
    try {
      const sites = getSitesFromDb();
      const firms = getFirmsFromDb();
      const trips = getTripsFromDb();
      const opRecords = getOpRecordsFromDb();
      const settings = getSettingsFromDb();

      res.json({
        sites,
        firms,
        trips,
        opRecords,
        settings,
        sqliteDbFile: DB_FILE,
        dbStatus: 'active',
      });
    } catch (err) {
      console.error('API Error /api/data:', err);
      res.status(500).json({ error: 'Failed to fetch data from SQLite' });
    }
  });

  app.post('/api/sites', async (req, res) => {
    try {
      const sites = req.body.sites;
      if (!Array.isArray(sites)) {
        return res.status(400).json({ error: 'Invalid payload' });
      }

      db.run('DELETE FROM sites');
      for (const site of sites) {
        db.run(
          `INSERT INTO sites (id, number, name, owner, phone, siteManager, siteManagerPhone, contactPerson, contactPhone, carnetSmsOverride, notes, createdAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            site.id,
            site.number || '',
            site.name || '',
            site.owner || '',
            site.phone || '',
            site.siteManager || '',
            site.siteManagerPhone || '',
            site.contactPerson || '',
            site.contactPhone || '',
            site.carnetSmsOverride || '',
            site.notes || '',
            site.createdAt || new Date().toISOString(),
          ]
        );
      }
      await saveDbToDisk();
      res.json({ status: 'ok', count: sites.length });
    } catch (err) {
      console.error('API Error /api/sites:', err);
      res.status(500).json({ error: 'Failed to update sites in SQLite' });
    }
  });

  app.post('/api/firms', async (req, res) => {
    try {
      const firms = req.body.firms;
      if (!Array.isArray(firms)) {
        return res.status(400).json({ error: 'Invalid payload' });
      }

      db.run('DELETE FROM supplier_firms');
      for (const firm of firms) {
        db.run(
          `INSERT INTO supplier_firms (id, name, color, address, mapUrl, phone, email, contactsJson, notes, createdAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            firm.id,
            firm.name || '',
            firm.color || '#3b82f6',
            firm.address || '',
            firm.mapUrl || '',
            firm.phone || '',
            firm.email || '',
            JSON.stringify(firm.contacts || []),
            firm.notes || '',
            firm.createdAt || new Date().toISOString(),
          ]
        );
      }
      await saveDbToDisk();
      res.json({ status: 'ok', count: firms.length });
    } catch (err) {
      console.error('API Error /api/firms:', err);
      res.status(500).json({ error: 'Failed to update firms in SQLite' });
    }
  });

  app.post('/api/trips', async (req, res) => {
    try {
      const trips = req.body.trips;
      if (!Array.isArray(trips)) {
        return res.status(400).json({ error: 'Invalid payload' });
      }

      db.run('DELETE FROM trips');
      for (const trip of trips) {
        db.run(
          `INSERT INTO trips (id, startTime, endTime, siteId, siteNumber, siteName, siteOwner, sitePhone, siteManager, siteManagerPhone, siteContactPerson, siteContactPhone, firmId, firmIdsJson, firmName, firmNamesJson, firmColor, firmPhone, vehiclePlate, carnetText, carnetCopiedAt, content, startKm, endKm, status, createdAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            trip.id,
            trip.startTime || '',
            trip.endTime || '',
            trip.siteId || '',
            trip.siteNumber || '',
            trip.siteName || '',
            trip.siteOwner || '',
            trip.sitePhone || '',
            trip.siteManager || '',
            trip.siteManagerPhone || '',
            trip.siteContactPerson || '',
            trip.siteContactPhone || '',
            trip.firmId || '',
            JSON.stringify(trip.firmIds || []),
            trip.firmName || '',
            JSON.stringify(trip.firmNames || []),
            trip.firmColor || '',
            trip.firmPhone || '',
            trip.vehiclePlate || '6AH 5297',
            trip.carnetText || '',
            trip.carnetCopiedAt || '',
            trip.content || '',
            trip.startKm ?? null,
            trip.endKm ?? null,
            trip.status || 'completed',
            trip.createdAt || new Date().toISOString(),
          ]
        );
      }
      await saveDbToDisk();
      res.json({ status: 'ok', count: trips.length });
    } catch (err) {
      console.error('API Error /api/trips:', err);
      res.status(500).json({ error: 'Failed to update trips in SQLite' });
    }
  });

  app.post('/api/op-records', async (req, res) => {
    try {
      const records = req.body.records;
      if (!Array.isArray(records)) {
        return res.status(400).json({ error: 'Invalid payload' });
      }

      db.run('DELETE FROM op_records');
      for (const op of records) {
        db.run(
          `INSERT INTO op_records (id, opNumber, title, supplierName, siteNumber, itemsJson, documentDataUrl, documentFileName, documentFileType, notes, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            op.id,
            op.opNumber || '',
            op.title || '',
            op.supplierName || '',
            op.siteNumber || '',
            JSON.stringify(op.items || []),
            op.documentDataUrl || '',
            op.documentFileName || '',
            op.documentFileType || '',
            op.notes || '',
            op.createdAt || new Date().toISOString(),
            op.updatedAt || new Date().toISOString(),
          ]
        );
      }
      await saveDbToDisk();
      res.json({ status: 'ok', count: records.length });
    } catch (err) {
      console.error('API Error /api/op-records:', err);
      res.status(500).json({ error: 'Failed to update OP records in SQLite' });
    }
  });

  app.post('/api/settings', async (req, res) => {
    try {
      const settings = req.body.settings;
      if (!settings) {
        return res.status(400).json({ error: 'Invalid settings' });
      }

      db.run("DELETE FROM app_settings WHERE key = 'app_settings'");
      db.run("INSERT INTO app_settings (key, valueJson) VALUES ('app_settings', ?)", [
        JSON.stringify(settings),
      ]);
      await saveDbToDisk();
      res.json({ status: 'ok' });
    } catch (err) {
      console.error('API Error /api/settings:', err);
      res.status(500).json({ error: 'Failed to update settings in SQLite' });
    }
  });

  // Direct download endpoint for downloading the app.sqlite database file
  app.get('/api/download-sqlite', (req, res) => {
    if (fs.existsSync(DB_FILE)) {
      res.download(DB_FILE, 'app.sqlite');
    } else {
      res.status(404).send('Database file not found');
    }
  });

  // Direct upload endpoint for importing an uploaded app.sqlite / .db database file
  app.post('/api/upload-sqlite', async (req, res) => {
    try {
      const { base64 } = req.body;
      if (!base64) {
        return res.status(400).json({ error: 'Chybí data databáze v base64' });
      }

      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }

      const buffer = Buffer.from(base64, 'base64');
      fs.writeFileSync(DB_FILE, buffer);

      const SQL = await initSqlJs();
      db = new SQL.Database(buffer);
      console.log('Successfully reloaded uploaded SQLite database from:', DB_FILE);

      res.json({ status: 'ok', message: 'SQLite databáze byla úspěšně nahraná a načtená.' });
    } catch (err) {
      console.error('API Error /api/upload-sqlite:', err);
      res.status(500).json({ error: 'Nedařilo se nahrát a načíst soubor databáze' });
    }
  });

  // Vite middleware for dev or static serve for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server with SQLite database running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
