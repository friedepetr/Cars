import React, { useState } from 'react';
import { X, Save, Clock, MapPin, Building2, Gauge, Info, Sparkles, Truck, Check, ChevronRight } from 'lucide-react';
import { Trip, Site, SupplierFirm, OPRecord, PURPOSE_PRESETS } from '../types';
import { TripContentInput } from './TripContentInput';

interface EditTripModalProps {
  trip: Trip;
  sites: Site[];
  firms: SupplierFirm[];
  opRecords?: OPRecord[];
  onOpenOP?: (opNumber: string) => void;
  onSave: (updatedTrip: Trip) => void;
  onClose: () => void;
}

function toDatetimeLocal(isoString?: string): string {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export const EditTripModal: React.FC<EditTripModalProps> = ({
  trip,
  sites,
  firms,
  opRecords,
  onOpenOP,
  onSave,
  onClose,
}) => {
  const [startTime, setStartTime] = useState<string>(toDatetimeLocal(trip.startTime));
  const [endTime, setEndTime] = useState<string>(toDatetimeLocal(trip.endTime));
  const [status, setStatus] = useState<'active' | 'completed' | 'cancelled'>(trip.status);

  // Site state
  const [siteId, setSiteId] = useState<string>(trip.siteId || (sites[0]?.id || ''));
  const [siteNumber, setSiteNumber] = useState<string>(trip.siteNumber);
  const [siteName, setSiteName] = useState<string>(trip.siteName);
  const [siteOwner, setSiteOwner] = useState<string>(trip.siteOwner || '');
  const [sitePhone, setSitePhone] = useState<string>(trip.sitePhone || '');
  const [siteManager, setSiteManager] = useState<string>(trip.siteManager || '');
  const [siteManagerPhone, setSiteManagerPhone] = useState<string>(trip.siteManagerPhone || '');
  const [siteContactPerson, setSiteContactPerson] = useState<string>(trip.siteContactPerson || '');
  const [siteContactPhone, setSiteContactPhone] = useState<string>(trip.siteContactPhone || '');

  // Firms state
  const [selectedFirmIds, setSelectedFirmIds] = useState<string[]>(
    trip.firmIds || (trip.firmId ? [trip.firmId] : [])
  );

  // Vehicle & Carnet
  const [vehiclePlate, setVehiclePlate] = useState<string>(trip.vehiclePlate);
  const [carnetText, setCarnetText] = useState<string>(trip.carnetText);

  // Content
  const [content, setContent] = useState<string>(trip.content);

  // KM
  const [startKm, setStartKm] = useState<string>(trip.startKm !== undefined ? String(trip.startKm) : '');
  const [endKm, setEndKm] = useState<string>(trip.endKm !== undefined ? String(trip.endKm) : '');

  // When site is changed from dropdown
  const handleSiteSelect = (selectedId: string) => {
    setSiteId(selectedId);
    const foundSite = sites.find((s) => s.id === selectedId);
    if (foundSite) {
      setSiteNumber(foundSite.number);
      setSiteName(foundSite.name);
      setSiteOwner(foundSite.owner || '');
      setSitePhone(foundSite.phone || '');
      setSiteManager(foundSite.siteManager || '');
      setSiteManagerPhone(foundSite.siteManagerPhone || '');
      setSiteContactPerson(foundSite.contactPerson || '');
      setSiteContactPhone(foundSite.contactPhone || '');
      setCarnetText(`${vehiclePlate};${foundSite.number};`);
    }
  };

  const toggleFirmSelection = (fId: string) => {
    setSelectedFirmIds((prev) =>
      prev.includes(fId) ? prev.filter((id) => id !== fId) : [...prev, fId]
    );
  };

  const addPresetToContent = (preset: string) => {
    if (!content.trim()) {
      setContent(preset);
    } else {
      setContent((prev) => `${prev}; ${preset}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedFirmsList = firms.filter((f) => selectedFirmIds.includes(f.id));
    const firmNamesJoined = selectedFirmsList.map((f) => f.name).join(', ');
    const firmPhonesJoined = selectedFirmsList
      .map((f) => f.phone)
      .filter(Boolean)
      .join(', ');

    const updated: Trip = {
      ...trip,
      startTime: startTime ? new Date(startTime).toISOString() : trip.startTime,
      endTime: status === 'completed' && endTime ? new Date(endTime).toISOString() : (status === 'active' ? undefined : (endTime ? new Date(endTime).toISOString() : trip.endTime)),
      status,
      siteId,
      siteNumber,
      siteName,
      siteOwner,
      sitePhone,
      siteManager,
      siteManagerPhone,
      siteContactPerson,
      siteContactPhone,
      firmId: selectedFirmIds.join(','),
      firmIds: selectedFirmIds,
      firmName: firmNamesJoined || undefined,
      firmNames: selectedFirmsList.map((f) => f.name),
      firmColor: selectedFirmsList[0]?.color,
      firmPhone: firmPhonesJoined || undefined,
      vehiclePlate,
      carnetText,
      content,
      startKm: startKm !== '' ? parseFloat(startKm) : undefined,
      endKm: endKm !== '' ? parseFloat(endKm) : undefined,
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto my-6">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">Upravit jízdu</h3>
              <p className="text-xs text-slate-400 font-mono">ID: {trip.id}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Status & Times Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <label htmlFor="edit-status-select" className="block text-xs font-bold text-slate-700 mb-1">
                Stav jízdy:
              </label>
              <select
                id="edit-status-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'completed' | 'cancelled')}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
              >
                <option value="active">🟢 Probíhá (Aktivní)</option>
                <option value="completed">✅ Dokončeno</option>
                <option value="cancelled">❌ Zrušeno</option>
              </select>
            </div>

            <div>
              <label htmlFor="edit-start-time" className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" /> Čas začátku:
              </label>
              <input
                id="edit-start-time"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                required
              />
            </div>

            <div>
              <label htmlFor="edit-end-time" className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-600" /> Čas konce:
              </label>
              <input
                id="edit-end-time"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          {/* Site selection */}
          <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <label htmlFor="edit-site-select" className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-600" /> Výběr cílové stavby
            </label>
            <select
              id="edit-site-select"
              value={siteId}
              onChange={(e) => handleSiteSelect(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
            >
              {[...sites]
                .sort((a, b) => a.name.localeCompare(b.name, 'cs', { sensitivity: 'base' }))
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.owner ? `(${s.owner})` : ''}
                  </option>
                ))}
            </select>

            {/* Editable site fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-100 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Číslo stavby:</label>
                <input
                  type="text"
                  value={siteNumber}
                  onChange={(e) => setSiteNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Název stavby:</label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Vlastník stavby:</label>
                <input
                  type="text"
                  value={siteOwner}
                  onChange={(e) => setSiteOwner(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Telefon vlastníka:</label>
                <input
                  type="text"
                  value={sitePhone}
                  onChange={(e) => setSitePhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Stavbyvedoucí:</label>
                <input
                  type="text"
                  value={siteManager}
                  onChange={(e) => setSiteManager(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Tel. stavbyvedoucího:</label>
                <input
                  type="text"
                  value={siteManagerPhone}
                  onChange={(e) => setSiteManagerPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Kontakt na stavbě:</label>
                <input
                  type="text"
                  value={siteContactPerson}
                  onChange={(e) => setSiteContactPerson(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Tel. kontakt na stavbě:</label>
                <input
                  type="text"
                  value={siteContactPhone}
                  onChange={(e) => setSiteContactPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Supplier Firms Selection */}
          <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-indigo-600" /> Dodavatelské firmy (nakládka - více firem)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {firms.map((f) => {
                const isSelected = selectedFirmIds.includes(f.id);
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => toggleFirmSelection(f.id)}
                    className={`p-2 rounded-lg border text-left transition-all flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 border-2 text-indigo-950 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                    style={{ borderColor: isSelected ? f.color || '#4f46e5' : undefined }}
                  >
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                        isSelected ? 'bg-indigo-600 border-indigo-700 text-white' : 'bg-white border-slate-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: f.color }} />
                    <span className="text-xs truncate">{f.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content & Purpose with Dropdown */}
          <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-600" /> Název a popis jízdy / účel
            </label>

            {/* Dropdown Menu for Purpose Presets */}
            <div className="space-y-1">
              <label htmlFor="edit-purpose-dropdown" className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Přidat předdefinovaný účel (rozevírací menu):
              </label>
              <div className="relative">
                <select
                  id="edit-purpose-dropdown"
                  onChange={(e) => {
                    if (e.target.value) {
                      addPresetToContent(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  defaultValue=""
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 pr-8 text-xs text-slate-900 font-medium appearance-none cursor-pointer"
                >
                  <option value="" disabled>
                    -- Vybrat účel jízdy ze seznamu --
                  </option>
                  {PURPOSE_PRESETS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </div>
              </div>
            </div>

            <TripContentInput
              value={content}
              onChange={setContent}
              opRecords={opRecords}
              onOpenOP={onOpenOP}
            />
          </div>

          {/* Odometer KM & Vehicle & Carnet */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-slate-500" /> Počáteční stav (km):
              </label>
              <input
                type="number"
                value={startKm}
                onChange={(e) => setStartKm(e.target.value)}
                placeholder="Např. 142300"
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-slate-500" /> Konečný stav (km):
              </label>
              <input
                type="number"
                value={endKm}
                onChange={(e) => setEndKm(e.target.value)}
                placeholder="Např. 142350"
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">SPZ vozidla:</label>
              <input
                type="text"
                value={vehiclePlate}
                onChange={(e) => setVehiclePlate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono text-slate-900 uppercase font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Carnet SMS:</label>
              <input
                type="text"
                value={carnetText}
                onChange={(e) => setCarnetText(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono text-blue-800"
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-200">
            <button
              type="submit"
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" /> Uložit změny jízdy
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm border border-slate-300 transition-all cursor-pointer"
            >
              Zrušit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
