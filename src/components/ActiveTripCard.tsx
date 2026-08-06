import React, { useState, useEffect } from 'react';
import { Play, Square, Clock, MapPin, Building2, Copy, AlertTriangle, Check, Gauge, User, UserCheck, HardHat, Mail, Truck, Pencil } from 'lucide-react';
import { Trip, Site, SupplierFirm, OPRecord } from '../types';
import { copyToClipboard, formatCarnetSms } from '../utils/storage';
import { RenderTripContent } from './TripContentInput';
import { PhoneCallLink } from './PhoneCallLink';
import { MapLinkButton } from './MapLinkButton';
import { SiteTripHeader } from './SiteTripHeader';
import { EditTripModal } from './EditTripModal';

interface ActiveTripCardProps {
  trip: Trip;
  sites?: Site[];
  firms?: SupplierFirm[];
  opRecords?: OPRecord[];
  onOpenOP?: (opNumber: string) => void;
  onEndTrip: (endKm?: number) => void;
  onCancelTrip: () => void;
  onUpdateTrip?: (updatedTrip: Trip) => void;
}

export const ActiveTripCard: React.FC<ActiveTripCardProps> = ({
  trip,
  sites,
  firms,
  opRecords,
  onOpenOP,
  onEndTrip,
  onCancelTrip,
  onUpdateTrip,
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [endKm, setEndKm] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [showEndDialog, setShowEndDialog] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);

  useEffect(() => {
    const calculateElapsed = () => {
      const start = new Date(trip.startTime).getTime();
      const now = new Date().getTime();
      const diffSec = Math.max(0, Math.floor((now - start) / 1000));
      setElapsedSeconds(diffSec);
    };

    calculateElapsed();
    const interval = setInterval(calculateElapsed, 1000);
    return () => clearInterval(interval);
  }, [trip.startTime]);

  const formatTimer = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    if (hrs > 0) {
      return `${hrs}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  const handleCopyCarnet = async () => {
    const text = trip.carnetText || formatCarnetSms(trip.vehiclePlate, trip.siteNumber);
    await copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    const kmNum = endKm ? parseFloat(endKm) : undefined;
    onEndTrip(kmNum);
  };

  const startTimeFormatted = new Date(trip.startTime).toLocaleTimeString('cs-CZ', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="bg-white border border-sky-100/90 rounded-2xl p-4 sm:p-6 shadow-sm shadow-blue-900/5 space-y-5 max-w-full">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="relative flex h-3.5 w-3.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
          </span>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2 truncate">
              <Play className="w-5 h-5 text-emerald-600 fill-emerald-600 shrink-0" />
              <span className="truncate">Probíhající jízda dodávkou</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium truncate">
              DODÁVKA: <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{trip.vehiclePlate}</span>
            </p>
          </div>
        </div>

        {/* Live Timer Badge */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-1.5 sm:py-2 flex items-center gap-2.5 shadow-xs shrink-0">
          <Clock className="w-5 h-5 text-blue-600 animate-pulse shrink-0" />
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Doba jízdy</div>
            <div className="font-mono text-xl sm:text-2xl font-extrabold text-blue-700 tracking-wider">
              {formatTimer(elapsedSeconds)}
            </div>
          </div>
        </div>
      </div>

      {/* Trip Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Site Details */}
        <div className="min-w-0">
          <SiteTripHeader
            siteNumber={trip.siteNumber}
            siteName={trip.siteName}
            siteOwner={trip.siteOwner}
            sitePhone={trip.sitePhone}
            siteManager={trip.siteManager}
            siteManagerPhone={trip.siteManagerPhone}
            contactPerson={trip.siteContactPerson}
            contactPhone={trip.siteContactPhone}
          />
        </div>

        {/* Pickup Firm / Supplier */}
        <div className="bg-slate-50 rounded-lg p-3.5 sm:p-4 border border-slate-200 space-y-2.5 min-w-0">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Building2 className="w-4 h-4 shrink-0 text-indigo-600" /> Vyzvednutí v firmách / dodavatelích
          </div>
          {trip.firmName ? (
            <div className="space-y-2.5">
              {/* List each firm on its own section with Name on row 1, Map link on row 2 */}
              <div className="flex flex-col gap-2 min-w-0 w-full">
                {trip.firmIds && trip.firmIds.length > 0 ? (
                  trip.firmIds.map((fId) => {
                    const matchedFirm = firms?.find((f) => f.id === fId);
                    const fName = matchedFirm?.name || fId;
                    const fColor = matchedFirm?.color || trip.firmColor || '#4f46e5';
                    const fPhone = matchedFirm?.phone;
                    return (
                      <div
                        key={fId}
                        className="flex flex-col gap-2 text-xs font-bold p-3 rounded-xl text-slate-900 border w-full min-w-0 bg-white shadow-2xs"
                        style={{
                          backgroundColor: `${fColor}08`,
                          borderColor: `${fColor}40`,
                        }}
                      >
                        {/* Row 1: Firm Name */}
                        <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                          <span className="w-3 h-3 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: fColor }} />
                          <span className="truncate">{fName}</span>
                        </div>

                        {/* Row 2: Map link & Phone */}
                        <div className="flex items-center gap-2 pt-1.5 border-t border-slate-200/60 flex-wrap">
                          <MapLinkButton
                            mapUrl={matchedFirm?.mapUrl}
                            address={matchedFirm?.address}
                            firmName={fName}
                            variant="button"
                            label="Zobrazit na mapě"
                          />
                          {fPhone && <PhoneCallLink phone={fPhone} variant="button" label="Volat" />}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  (trip.firmNames && trip.firmNames.length > 0
                    ? trip.firmNames
                    : trip.firmName.split(', ')
                  ).map((fName, idx) => {
                    const matchedFirm = firms?.find((f) => f.name.toLowerCase() === fName.toLowerCase());
                    return (
                      <div
                        key={idx}
                        className="flex flex-col gap-2 text-xs font-bold p-3 rounded-xl text-slate-900 border w-full min-w-0 bg-white shadow-2xs"
                        style={{
                          backgroundColor: `${trip.firmColor || '#3b82f6'}08`,
                          borderColor: `${trip.firmColor || '#3b82f6'}40`,
                        }}
                      >
                        {/* Row 1: Firm Name */}
                        <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                          <span
                            className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                            style={{ backgroundColor: trip.firmColor || '#3b82f6' }}
                          />
                          <span className="truncate">{fName}</span>
                        </div>

                        {/* Row 2: Map link & Phone */}
                        <div className="flex items-center gap-2 pt-1.5 border-t border-slate-200/60 flex-wrap">
                          <MapLinkButton
                            mapUrl={matchedFirm?.mapUrl}
                            address={matchedFirm?.address}
                            firmName={fName}
                            variant="button"
                            label="Zobrazit na mapě"
                          />
                          {matchedFirm?.phone && <PhoneCallLink phone={matchedFirm.phone} variant="button" label="Volat" />}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Find active firms objects contacts if available */}
              {(() => {
                const activeFirmsList = firms?.filter(
                  (f) => trip.firmIds?.includes(f.id) || f.id === trip.firmId
                ) || [];

                const firmsWithContacts = activeFirmsList.filter((f) => f.contacts && f.contacts.length > 0);
                if (firmsWithContacts.length === 0) return null;

                return (
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    {firmsWithContacts.map((f) => (
                      <div key={f.id} className="bg-white p-2 rounded-lg border border-slate-200 space-y-1">
                        <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: f.color }} />
                            {f.name}
                          </span>
                          {f.phone && <PhoneCallLink phone={f.phone} variant="button" label="Volat" />}
                        </div>
                        {f.contacts && f.contacts.length > 0 && (
                          <div className="text-[11px] text-slate-600 space-y-0.5 pt-1 border-t border-slate-100">
                            {f.contacts.map((c) => (
                              <div key={c.id} className="flex items-center justify-between gap-1">
                                <span>{c.name}</span>
                                {c.phone && <PhoneCallLink phone={c.phone} variant="badge" />}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          ) : (
            <span className="text-xs text-slate-500 italic">Bez zastávky v dodavatelské firmě</span>
          )}
        </div>
      </div>

      {/* Carnet SMS display & Quick re-copy */}
      <div className="bg-rose-50/80 rounded-lg p-3.5 border border-rose-200 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="text-xs text-rose-800 font-bold block mb-0.5">Carnet SMS kód pro tuto jízdu:</span>
          <span className="font-mono font-bold text-rose-700 text-base sm:text-lg tracking-wider bg-white px-3 py-1 rounded border border-rose-300 break-all select-all inline-block">
            {trip.carnetText}
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopyCarnet}
          className="px-3 py-2 rounded-lg bg-white hover:bg-rose-100 text-rose-900 text-xs font-bold flex items-center gap-1.5 border border-rose-300 active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" /> Zkopírováno!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-rose-600" /> Zkopírovat SMS znova
            </>
          )}
        </button>
      </div>

      {/* Content description */}
      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-2 min-w-0">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Obsah a úkoly jízdy</div>
        <RenderTripContent content={trip.content} opRecords={opRecords} onOpenOP={onOpenOP} />
      </div>

      {/* Trip Metadata (Start time, Km) */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 px-1 font-mono">
        <div>Začátek jízdy: <span className="text-slate-900 font-bold">{startTimeFormatted}</span></div>
        {trip.startKm !== undefined && (
          <div>Počáteční stav tachometru: <span className="text-slate-900 font-bold">{trip.startKm} km</span></div>
        )}
      </div>

      {/* Actions: End Trip Form or Button */}
      {!showEndDialog ? (
        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <button
            type="button"
            id="btn-open-end-trip"
            onClick={() => setShowEndDialog(true)}
            className="flex-1 py-3 px-5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-base flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all cursor-pointer"
          >
            <Square className="w-5 h-5 fill-current shrink-0" />
            <span className="truncate">Ukončit jízdu</span>
          </button>

          {onUpdateTrip && (
            <button
              type="button"
              onClick={() => setShowEditModal(true)}
              className="py-3 px-4 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-sm flex items-center justify-center gap-2 border border-blue-300 active:scale-95 transition-all cursor-pointer shadow-2xs"
            >
              <Pencil className="w-4 h-4 text-blue-600 shrink-0" /> Upravit jízdu
            </button>
          )}

          <button
            type="button"
            onClick={onCancelTrip}
            className="py-3 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm flex items-center justify-center gap-2 border border-slate-300 active:scale-95 transition-all cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" /> Zrušit
          </button>
        </div>
      ) : (
        <form onSubmit={handleFinish} className="bg-slate-50 p-4 rounded-lg border border-rose-300 space-y-4 animate-fade-in shadow-sm">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Square className="w-5 h-5 text-rose-600 fill-rose-600 shrink-0" /> Potvrzení ukončení jízdy
          </h3>

          <div>
            <label htmlFor="end-km-input" className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-blue-600 shrink-0" /> Konečný stav km (volitelné):
            </label>
            <input
              id="end-km-input"
              type="number"
              placeholder={trip.startKm ? `Např. ${trip.startKm + 25}` : 'Zadejte stávající stav tachometru...'}
              value={endKm}
              onChange={(e) => setEndKm(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:border-rose-600 text-sm"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              type="submit"
              id="btn-confirm-end-trip"
              className="flex-1 min-w-[180px] py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all text-sm cursor-pointer"
            >
              <Square className="w-4 h-4 fill-current shrink-0" /> Potvrdit a uložit jízdu
            </button>
            <button
              type="button"
              onClick={() => setShowEndDialog(false)}
              className="px-4 py-3 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-lg text-sm border border-slate-300 cursor-pointer"
            >
              Zpět
            </button>
          </div>
        </form>
      )}

      {/* Edit Trip Modal */}
      {showEditModal && onUpdateTrip && (
        <EditTripModal
          trip={trip}
          sites={sites || []}
          firms={firms || []}
          opRecords={opRecords}
          onOpenOP={onOpenOP}
          onSave={onUpdateTrip}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
};

