import React, { useState, useEffect, useRef } from 'react';
import { Play, MapPin, Building2, Lock, Plus, Gauge, Info, ChevronRight, User, UserCheck, HardHat, Search, Sparkles, Truck, Check } from 'lucide-react';
import { Site, SupplierFirm, Trip, OPRecord, PURPOSE_PRESETS } from '../types';
import { formatCarnetSms } from '../utils/storage';
import { CarnetSmsCopyButton } from './CarnetSmsCopyButton';
import { TripContentInput } from './TripContentInput';
import { SiteTripHeader } from './SiteTripHeader';
import { MapLinkButton } from './MapLinkButton';

interface StartTripFormProps {
  sites: Site[];
  firms: SupplierFirm[];
  vehiclePlate: string;
  opRecords?: OPRecord[];
  onOpenOP?: (opNumber: string) => void;
  onStartTrip: (tripData: Omit<Trip, 'id' | 'createdAt' | 'status'>) => void;
  onNavigateToSites: () => void;
  onNavigateToFirms: () => void;
}

export const StartTripForm: React.FC<StartTripFormProps> = ({
  sites,
  firms,
  vehiclePlate,
  opRecords,
  onOpenOP,
  onStartTrip,
  onNavigateToSites,
  onNavigateToFirms,
}) => {
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');
  const [selectedFirmIds, setSelectedFirmIds] = useState<string[]>([]);
  const [content, setContent] = useState<string>('');
  const [startKm, setStartKm] = useState<string>('');
  const [isCarnetCopied, setIsCarnetCopied] = useState<boolean>(false);
  const [copiedCarnetText, setCopiedCarnetText] = useState<string>('');
  const [siteSearch, setSiteSearch] = useState<string>('');

  // Refs for auto-scrolling between steps
  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);
  const step4Ref = useRef<HTMLDivElement>(null);

  const scrollToRef = (ref: React.RefObject<HTMLDivElement | null>) => {
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  };

  // Auto-select first site if available
  useEffect(() => {
    if (sites.length > 0 && !selectedSiteId) {
      setSelectedSiteId(sites[0].id);
    }
  }, [sites, selectedSiteId]);

  const selectedSite = sites.find((s) => s.id === selectedSiteId) || sites[0];
  const selectedFirms = firms.filter((f) => selectedFirmIds.includes(f.id));

  // Toggle firm multi-selection
  const toggleFirmSelection = (firmId: string) => {
    setSelectedFirmIds((prev) =>
      prev.includes(firmId) ? prev.filter((id) => id !== firmId) : [...prev, firmId]
    );
    scrollToRef(step4Ref);
  };

  const clearFirmsSelection = () => {
    setSelectedFirmIds([]);
    scrollToRef(step4Ref);
  };

  // When site changes, reset copy requirement and auto scroll to Carnet SMS step
  const handleSiteChange = (siteId: string) => {
    setSelectedSiteId(siteId);
    setIsCarnetCopied(false);
    setCopiedCarnetText('');
    scrollToRef(step2Ref);
  };

  const carnetText = selectedSite
    ? formatCarnetSms(vehiclePlate, selectedSite.number)
    : formatCarnetSms(vehiclePlate, '');

  const handleCopiedCarnet = (text: string) => {
    setIsCarnetCopied(true);
    setCopiedCarnetText(text);
    // Auto-scroll to Step 3 (Firms)
    scrollToRef(step3Ref);
  };

  const addPresetToContent = (presetText: string) => {
    if (!content.trim()) {
      setContent(presetText);
    } else {
      setContent(`${content.trim()}; ${presetText}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSite) {
      alert('Prosím vyberte stavbu ze seznamu.');
      return;
    }

    if (!isCarnetCopied) {
      alert('Před zahájením jízdy musíte nejprve zkopírovat Carnet SMS do schránky!');
      return;
    }

    const nowIso = new Date().toISOString();
    const kmNum = startKm ? parseFloat(startKm) : undefined;

    const firmNamesJoined = selectedFirms.map((f) => f.name).join(', ');
    const firmPhonesJoined = selectedFirms
      .map((f) => f.phone)
      .filter(Boolean)
      .join(', ');

    onStartTrip({
      startTime: nowIso,
      siteId: selectedSite.id,
      siteNumber: selectedSite.number,
      siteName: selectedSite.name,
      siteOwner: selectedSite.owner,
      sitePhone: selectedSite.phone,
      siteManager: selectedSite.siteManager,
      siteManagerPhone: selectedSite.siteManagerPhone,
      siteContactPerson: selectedSite.contactPerson,
      siteContactPhone: selectedSite.contactPhone,
      firmId: selectedFirmIds.join(','),
      firmIds: selectedFirmIds,
      firmName: firmNamesJoined || undefined,
      firmNames: selectedFirms.map((f) => f.name),
      firmColor: selectedFirms[0]?.color,
      firmPhone: firmPhonesJoined || undefined,
      vehiclePlate: vehiclePlate || '6AH 5297',
      carnetText: copiedCarnetText || carnetText,
      carnetCopiedAt: nowIso,
      content: content.trim(),
      startKm: kmNum,
    });
  };

  const filteredSites = [...sites]
    .filter(
      (s) =>
        s.number.toLowerCase().includes(siteSearch.toLowerCase()) ||
        s.name.toLowerCase().includes(siteSearch.toLowerCase()) ||
        s.owner.toLowerCase().includes(siteSearch.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name, 'cs', { sensitivity: 'base' }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-full">
      {/* STEP 1: Výběr Cílové Stavby */}
      <div ref={step1Ref} className="scroll-mt-16 bg-white rounded-2xl p-4 sm:p-5 border border-sky-100 space-y-3.5 shadow-xs hover:border-sky-200 transition-all">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <label htmlFor="site-select" className="text-base font-black text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600 shrink-0" />
            <span>1. Vyberte cílovou stavbu</span>
          </label>
          <button
            type="button"
            onClick={onNavigateToSites}
            className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Přidat / Upravit stavby
          </button>
        </div>

        {sites.length === 0 ? (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-center space-y-2">
            <p className="text-sm text-blue-900 font-medium">Žádná stavba v seznamu.</p>
            <button
              type="button"
              onClick={onNavigateToSites}
              className="px-4 py-2 bg-blue-600 text-white font-bold text-sm rounded-lg hover:bg-blue-700 shadow-sm cursor-pointer"
            >
              Přidat prvotní stavbu
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Quick Search & Filter bar for site selection */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Rychlé hledání stavby podle názvu..."
                value={siteSearch}
                onChange={(e) => setSiteSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Visual Quick Select Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {filteredSites.map((site) => {
                const isSelected = selectedSiteId === site.id;
                return (
                  <button
                    key={site.id}
                    type="button"
                    onClick={() => handleSiteChange(site.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-2.5 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white border-2 border-blue-700 shadow-md ring-2 ring-blue-300'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-900'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className={`font-extrabold text-xs sm:text-sm truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                        {site.name}
                      </div>
                      {site.owner && (
                        <div className={`text-[11px] truncate font-medium ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                          {site.owner}
                        </div>
                      )}
                    </div>

                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-white text-blue-600 flex items-center justify-center shrink-0 font-bold shadow-xs">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Detailed Contacts Box for Selected Site */}
            {selectedSite && (
              <div className="mt-2">
                <SiteTripHeader
                  siteNumber={selectedSite.number}
                  siteName={selectedSite.name}
                  siteOwner={selectedSite.owner}
                  sitePhone={selectedSite.phone}
                  siteManager={selectedSite.siteManager}
                  siteManagerPhone={selectedSite.siteManagerPhone}
                  contactPerson={selectedSite.contactPerson}
                  contactPhone={selectedSite.contactPhone}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* STEP 2: Účel, obsah a úkoly jízdy (OP) & Počáteční stav km */}
      <div ref={step2Ref} className="scroll-mt-16 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-4 shadow-xs">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <label className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600 shrink-0" />
            <span>2. Účel, obsah a úkoly jízdy (OP)</span>
          </label>
        </div>

        {/* Dropdown Menu for Purpose Selection */}
        <div className="space-y-1.5">
          <label htmlFor="purpose-select-dropdown" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Vybrat předdefinovaný účel jízdy:</span>
          </label>
          <div className="relative">
            <select
              id="purpose-select-dropdown"
              onChange={(e) => {
                if (e.target.value) {
                  addPresetToContent(e.target.value);
                  e.target.value = '';
                }
              }}
              defaultValue=""
              className="w-full bg-sky-50/50 border border-sky-200 hover:border-blue-400 focus:border-blue-600 rounded-xl p-3 pr-8 text-xs sm:text-sm text-slate-900 font-medium focus:outline-none focus:bg-white transition-all appearance-none cursor-pointer shadow-2xs"
            >
              <option value="" disabled>
                -- Zvolte účel jízdy ze seznamu --
              </option>

              {PURPOSE_PRESETS.map((preset) => (
                <option key={preset} value={preset}>
                  {preset}
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

        <div className="pt-2 border-t border-slate-100">
          <label htmlFor="start-km-input" className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
            <Gauge className="w-3.5 h-3.5 text-slate-500" /> Počáteční stav tachometru km (volitelné):
          </label>
          <input
            id="start-km-input"
            type="number"
            placeholder="Např. 142350"
            value={startKm}
            onChange={(e) => setStartKm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white text-sm"
          />
        </div>
      </div>

      {/* STEP 3: MULTI-FIRM SELECTION */}
      <div ref={step3Ref} className="scroll-mt-16 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3 shadow-xs">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <label className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600 shrink-0" />
              <span>3. Dodavatelské firmy (nakládka - více firem)</span>
            </label>
          </div>
          <button
            type="button"
            onClick={onNavigateToFirms}
            className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Spravovat firmy
          </button>
        </div>

        {/* Selected firms overview box */}
        {selectedFirms.length > 0 && (
          <div className="bg-indigo-50 border border-indigo-200 p-3 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-indigo-950 font-extrabold flex items-center gap-1.5">
                <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                Vybrané firmy pro nakládku ({selectedFirms.length}):
              </span>
              <button
                type="button"
                onClick={clearFirmsSelection}
                className="text-[11px] text-indigo-700 hover:text-indigo-900 font-bold underline cursor-pointer shrink-0"
              >
                Zrušit výběr
              </button>
            </div>
            <div className="flex flex-col gap-2 pt-1 border-t border-indigo-200/80">
              {selectedFirms.map((f) => (
                <div
                  key={f.id}
                  className="flex flex-col gap-1.5 bg-white p-2.5 rounded-lg border border-indigo-200 text-slate-900 font-bold min-w-0 shadow-2xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: f.color }} />
                    <span className="truncate text-xs font-extrabold">{f.name}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100 flex-wrap">
                    <MapLinkButton
                      mapUrl={f.mapUrl}
                      address={f.address}
                      firmName={f.name}
                      variant="button"
                      label="Zobrazit na mapě"
                      className="text-[10px] py-0.5 px-2"
                    />
                    {f.phone && (
                      <span className="font-mono text-[11px] text-slate-500 font-normal">
                        {f.phone}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Firm Chips / Grid Multi-Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
          <button
            type="button"
            onClick={clearFirmsSelection}
            className={`p-2.5 rounded-lg border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
              selectedFirmIds.length === 0
                ? 'bg-slate-100 border-2 border-slate-400 text-slate-900 font-bold'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className="w-3 h-3 rounded-full bg-slate-400 shrink-0" />
            <span className="text-xs truncate">Bez zastávky v firmě</span>
          </button>

          {firms.map((firm) => {
            const isSelected = selectedFirmIds.includes(firm.id);
            return (
              <button
                key={firm.id}
                type="button"
                onClick={() => toggleFirmSelection(firm.id)}
                className={`p-2.5 rounded-lg border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50/90 border-2 text-indigo-950 font-bold shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
                style={{
                  borderColor: isSelected ? firm.color || '#4f46e5' : undefined,
                }}
              >
                <div
                  className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border ${
                    isSelected ? 'bg-indigo-600 border-indigo-700 text-white' : 'bg-white border-slate-300'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>

                <span
                  className="w-3 h-3 rounded-full shrink-0 border border-slate-300"
                  style={{ backgroundColor: firm.color }}
                />

                <div className="truncate text-xs min-w-0 flex-1">
                  <div className="font-bold truncate text-slate-900">{firm.name}</div>
                  {firm.address && <div className="text-[10px] text-slate-500 truncate">{firm.address}</div>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 4: Carnet SMS & Zahájit jízdu */}
      <div ref={step4Ref} className="scroll-mt-16 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-4 shadow-xs">
        {selectedSite && (
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
              4. Carnet SMS
            </div>
            <CarnetSmsCopyButton
              spz={vehiclePlate}
              siteNumber={selectedSite.number}
              isCopied={isCarnetCopied}
              onCopied={handleCopiedCarnet}
              carnetText={carnetText}
            />
          </div>
        )}

        <button
          type="submit"
          id="btn-start-trip"
          className="w-full py-4 px-4 sm:px-6 rounded-2xl font-black text-base sm:text-lg flex items-center justify-center gap-2.5 transition-all shadow-md shadow-blue-500/25 bg-gradient-to-r from-blue-600 via-sky-600 to-blue-700 hover:from-blue-700 hover:to-sky-700 text-white active:scale-[0.98] cursor-pointer min-h-[52px]"
        >
          <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-white shrink-0" />
          <span className="truncate">ZAHÁJIT JÍZDU DODÁVKOU</span>
          <ChevronRight className="w-5 h-5 shrink-0" />
        </button>
      </div>
    </form>
  );
};


