import React, { useState, useEffect } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { StartTripForm } from './components/StartTripForm';
import { ActiveTripCard } from './components/ActiveTripCard';
import { TripList } from './components/TripList';
import { SitesManager } from './components/SitesManager';
import { FirmsManager } from './components/FirmsManager';
import { SettingsManager } from './components/SettingsManager';

import { Site, SupplierFirm, Trip, AppSettings, OPRecord } from './types';
import { OPDetailModal } from './components/OPDetailModal';
import {
  loadSites,
  saveSites,
  loadFirms,
  saveFirms,
  loadTrips,
  saveTrips,
  loadSettings,
  saveSettings,
  loadOPRecords,
  saveOPRecords,
  fetchSqliteData,
} from './utils/storage';

export default function App() {
  const [sites, setSites] = useState<Site[]>(loadSites);
  const [firms, setFirms] = useState<SupplierFirm[]>(loadFirms);
  const [trips, setTrips] = useState<Trip[]>(loadTrips);
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [opRecords, setOpRecords] = useState<OPRecord[]>(loadOPRecords);
  const [activeTab, setActiveTab] = useState<NavTab>('start');
  const [activeOPNumber, setActiveOPNumber] = useState<string | null>(null);

  // Fetch initial state directly from server SQLite database
  useEffect(() => {
    fetchSqliteData().then((data) => {
      if (data) {
        if (data.sites) setSites(data.sites);
        if (data.firms) setFirms(data.firms);
        if (data.trips) setTrips(data.trips);
        if (data.opRecords) setOpRecords(data.opRecords);
        if (data.settings) setSettings(data.settings);
      }
    });
  }, []);

  // Sync to storage on change
  useEffect(() => {
    saveSites(sites);
  }, [sites]);

  useEffect(() => {
    saveFirms(firms);
  }, [firms]);

  useEffect(() => {
    saveTrips(trips);
  }, [trips]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveOPRecords(opRecords);
  }, [opRecords]);

  const handleSaveOPRecord = (updatedRecord: OPRecord) => {
    setOpRecords((prev) => {
      const existingIdx = prev.findIndex(
        (r) => r.opNumber.toLowerCase() === updatedRecord.opNumber.toLowerCase()
      );
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = updatedRecord;
        return copy;
      }
      return [updatedRecord, ...prev];
    });
  };

  const handleOpenOP = (opNum: string) => {
    setActiveOPNumber(opNum);
  };

  const handleOpenOPManagerModal = () => {
    if (opRecords.length > 0) {
      setActiveOPNumber(opRecords[0].opNumber);
    } else {
      setActiveOPNumber('OP-2026/045');
    }
  };

  // Find currently active trip if any
  const activeTrip = trips.find((t) => t.status === 'active') || null;

  // Handler to start a new trip
  const handleStartTrip = (tripData: Omit<Trip, 'id' | 'createdAt' | 'status'>) => {
    const newTrip: Trip = {
      ...tripData,
      id: `trip-${Date.now()}`,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    setTrips((prev) => [newTrip, ...prev]);
    setActiveTab('start');
  };

  // Handler to end an active trip
  const handleEndTrip = (endKm?: number) => {
    if (!activeTrip) return;
    const nowIso = new Date().toISOString();
    setTrips((prev) =>
      prev.map((t) => {
        if (t.id === activeTrip.id) {
          return {
            ...t,
            endTime: nowIso,
            endKm: endKm !== undefined ? endKm : t.endKm,
            status: 'completed',
          };
        }
        return t;
      })
    );
    setActiveTab('history');
  };

  // Handler to cancel active trip
  const handleCancelTrip = () => {
    if (!activeTrip) return;
    if (confirm('Opravdu chcete zrušit probíhající jízdu bez uložení?')) {
      setTrips((prev) => prev.filter((t) => t.id !== activeTrip.id));
    }
  };

  // Site handlers
  const handleAddSite = (siteData: Omit<Site, 'id' | 'createdAt'>) => {
    const newSite: Site = {
      ...siteData,
      id: `site-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setSites((prev) => [newSite, ...prev]);
  };

  const handleUpdateSite = (updatedSite: Site) => {
    setSites((prev) => prev.map((s) => (s.id === updatedSite.id ? updatedSite : s)));
  };

  const handleDeleteSite = (id: string) => {
    setSites((prev) => prev.filter((s) => s.id !== id));
  };

  // Firm handlers
  const handleAddFirm = (firmData: Omit<SupplierFirm, 'id' | 'createdAt'>) => {
    const newFirm: SupplierFirm = {
      ...firmData,
      id: `firm-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setFirms((prev) => [newFirm, ...prev]);
  };

  const handleUpdateFirm = (updatedFirm: SupplierFirm) => {
    setFirms((prev) => prev.map((f) => (f.id === updatedFirm.id ? updatedFirm : f)));
  };

  const handleDeleteFirm = (id: string) => {
    setFirms((prev) => prev.filter((f) => f.id !== id));
  };

  // Trip history handlers
  const handleUpdateTrip = (updatedTrip: Trip) => {
    setTrips((prev) => prev.map((t) => (t.id === updatedTrip.id ? updatedTrip : t)));
  };

  const handleDeleteTrip = (id: string) => {
    setTrips((prev) => prev.filter((t) => t.id !== id));
  };

  const handleClearAllTrips = () => {
    setTrips([]);
  };

  // Reset demo data
  const handleResetAllData = (
    newSites: Site[],
    newFirms: SupplierFirm[],
    newTrips: Trip[],
    newSettings: AppSettings
  ) => {
    setSites(newSites);
    setFirms(newFirms);
    setTrips(newTrips);
    setSettings(newSettings);
  };

  const completedTripsCount = trips.filter((t) => t.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50/40 to-slate-100 text-slate-900 flex flex-col font-sans pb-24 md:pb-8 overflow-x-hidden max-w-full">
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        activeTrip={activeTrip}
        sitesCount={sites.length}
        firmsCount={firms.length}
        completedTripsCount={completedTripsCount}
        vehiclePlate={settings.defaultPlate}
        opCount={opRecords.length}
        onOpenOPManager={handleOpenOPManagerModal}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 space-y-6">
        {activeTab === 'start' && (
          <div className="space-y-6">
            {activeTrip ? (
              <ActiveTripCard
                trip={activeTrip}
                sites={sites}
                firms={firms}
                opRecords={opRecords}
                onOpenOP={handleOpenOP}
                onEndTrip={handleEndTrip}
                onCancelTrip={handleCancelTrip}
                onUpdateTrip={handleUpdateTrip}
              />
            ) : (
              <StartTripForm
                sites={sites}
                firms={firms}
                vehiclePlate={settings.defaultPlate}
                opRecords={opRecords}
                onOpenOP={handleOpenOP}
                onStartTrip={handleStartTrip}
                onNavigateToSites={() => setActiveTab('sites')}
                onNavigateToFirms={() => setActiveTab('firms')}
              />
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <TripList
            trips={trips}
            sites={sites}
            firms={firms}
            opRecords={opRecords}
            onOpenOP={handleOpenOP}
            onUpdateTrip={handleUpdateTrip}
            onDeleteTrip={handleDeleteTrip}
            onClearAllTrips={handleClearAllTrips}
          />
        )}

        {activeTab === 'sites' && (
          <SitesManager
            sites={sites}
            vehiclePlate={settings.defaultPlate}
            onAddSite={handleAddSite}
            onUpdateSite={handleUpdateSite}
            onDeleteSite={handleDeleteSite}
          />
        )}

        {activeTab === 'firms' && (
          <FirmsManager
            firms={firms}
            onAddFirm={handleAddFirm}
            onUpdateFirm={handleUpdateFirm}
            onDeleteFirm={handleDeleteFirm}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsManager
            settings={settings}
            onSaveSettings={setSettings}
            onResetAllData={handleResetAllData}
          />
        )}
      </main>

      {/* Global OP Detail Modal */}
      {activeOPNumber && (
        <OPDetailModal
          opNumber={activeOPNumber}
          opRecord={
            opRecords.find(
              (r) => r.opNumber.toLowerCase() === activeOPNumber.toLowerCase()
            ) || null
          }
          onSaveOPRecord={handleSaveOPRecord}
          onClose={() => setActiveOPNumber(null)}
        />
      )}
    </div>
  );
}
