import React, { useState, useMemo } from 'react';
import { History, Search, Download, Trash2, Calendar, Clock, MapPin, Building2, Copy, Check, Gauge, Sparkles, User, UserCheck, Truck, Pencil, ChevronDown, ChevronRight, FolderOpen, Filter } from 'lucide-react';
import { Trip, Site, SupplierFirm, OPRecord } from '../types';
import { RenderTripContent } from './TripContentInput';
import { copyToClipboard, formatSiteNumber } from '../utils/storage';
import { PhoneCallLink } from './PhoneCallLink';
import { SiteTripHeader } from './SiteTripHeader';
import { MapLinkButton } from './MapLinkButton';
import { EditTripModal } from './EditTripModal';

interface TripListProps {
  trips: Trip[];
  sites: Site[];
  firms: SupplierFirm[];
  opRecords?: OPRecord[];
  onOpenOP?: (opNumber: string) => void;
  onUpdateTrip?: (updatedTrip: Trip) => void;
  onDeleteTrip: (id: string) => void;
  onClearAllTrips: () => void;
}

interface MonthGroup {
  monthId: string; // e.g. "2026-08"
  monthTitle: string; // e.g. "Srpen 2026"
  isCurrentMonth: boolean;
  trips: Trip[];
}

export const TripList: React.FC<TripListProps> = ({
  trips,
  sites,
  firms,
  opRecords,
  onOpenOP,
  onUpdateTrip,
  onDeleteTrip,
  onClearAllTrips,
}) => {
  const [search, setSearch] = useState('');
  const [selectedMonthFilter, setSelectedMonthFilter] = useState('');
  const [selectedSiteFilter, setSelectedSiteFilter] = useState('');
  const [selectedFirmFilter, setSelectedFirmFilter] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingTripId, setDeletingTripId] = useState<string | null>(null);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [showClearAllModal, setShowClearAllModal] = useState(false);

  // Manual toggle state for expanded/collapsed month accordions
  const [openMonthMap, setOpenMonthMap] = useState<Record<string, boolean>>({});

  const now = new Date();
  const currentMonthId = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const formatCzechDayAndDate = (dateIso: string) => {
    const d = new Date(dateIso);
    if (isNaN(d.getTime())) return dateIso;
    const daysShort = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];
    const dayAbbr = daysShort[d.getDay()];
    const dateFormatted = `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
    return `${dayAbbr} ${dateFormatted}`;
  };

  const getMonthTitle = (dateIso: string) => {
    const d = new Date(dateIso);
    if (isNaN(d.getTime())) return 'Neznámý měsíc';
    const monthNameRaw = d.toLocaleDateString('cs-CZ', { month: 'long' });
    const monthName = monthNameRaw.charAt(0).toUpperCase() + monthNameRaw.slice(1);
    return `${monthName} ${d.getFullYear()}`;
  };

  const getMonthId = (dateIso: string) => {
    const d = new Date(dateIso);
    if (isNaN(d.getTime())) return 'unknown';
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  const getRelativeDateBadge = (dateIso: string) => {
    const tripDate = new Date(dateIso);
    if (isNaN(tripDate.getTime())) return { label: '', color: '' };

    const tripMidnight = new Date(tripDate.getFullYear(), tripDate.getMonth(), tripDate.getDate()).getTime();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    const diffDays = Math.round((todayMidnight - tripMidnight) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return { label: 'Dnes', color: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-extrabold' };
    }
    if (diffDays === 1) {
      return { label: 'Včera', color: 'bg-sky-100 text-sky-900 border-sky-300 font-extrabold' };
    }
    if (diffDays >= 2 && diffDays < 7) {
      return { label: `Před ${diffDays} dny`, color: 'bg-blue-50 text-blue-800 border-blue-200 font-bold' };
    }
    if (diffDays >= 7 && diffDays < 14) {
      return { label: 'Před týdnem', color: 'bg-indigo-50 text-indigo-800 border-indigo-200 font-bold' };
    }
    if (diffDays >= 14 && diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return { label: `Před ${weeks} týdny`, color: 'bg-indigo-50 text-indigo-800 border-indigo-200 font-bold' };
    }
    if (diffDays >= 30 && diffDays < 60) {
      return { label: 'Před měsícem', color: 'bg-slate-100 text-slate-700 border-slate-300 font-bold' };
    }
    if (diffDays >= 60 && diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return { label: `Před ${months} měsíci`, color: 'bg-slate-100 text-slate-700 border-slate-300 font-bold' };
    }
    const years = Math.floor(diffDays / 365);
    return { label: `Před ${years} ${years === 1 ? 'rokem' : 'lety'}`, color: 'bg-slate-100 text-slate-700 border-slate-300 font-bold' };
  };

  const completedTrips = trips.filter((t) => t.status === 'completed');

  // Filter completed trips by search, site, firm, and optional month filter
  const filteredTrips = useMemo(() => {
    return completedTrips.filter((trip) => {
      const matchSearch =
        trip.siteName.toLowerCase().includes(search.toLowerCase()) ||
        trip.siteNumber.toLowerCase().includes(search.toLowerCase()) ||
        (trip.firmName && trip.firmName.toLowerCase().includes(search.toLowerCase())) ||
        trip.content.toLowerCase().includes(search.toLowerCase());

      const matchSite = !selectedSiteFilter || trip.siteId === selectedSiteFilter;
      const matchFirm = !selectedFirmFilter || trip.firmId === selectedFirmFilter;
      const matchMonth = !selectedMonthFilter || getMonthId(trip.startTime) === selectedMonthFilter;

      return matchSearch && matchSite && matchFirm && matchMonth;
    });
  }, [completedTrips, search, selectedSiteFilter, selectedFirmFilter, selectedMonthFilter]);

  // Group filtered trips by Month
  const monthGroups = useMemo(() => {
    const groupsMap = new Map<string, MonthGroup>();

    filteredTrips.forEach((trip) => {
      const mId = getMonthId(trip.startTime);
      const title = getMonthTitle(trip.startTime);

      if (!groupsMap.has(mId)) {
        groupsMap.set(mId, {
          monthId: mId,
          monthTitle: title,
          isCurrentMonth: mId === currentMonthId,
          trips: [],
        });
      }
      groupsMap.get(mId)!.trips.push(trip);
    });

    // Convert map to array sorted by date descending (newest month first)
    const sortedGroups = Array.from(groupsMap.values()).sort((a, b) => (b.monthId > a.monthId ? 1 : -1));
    return sortedGroups;
  }, [filteredTrips, currentMonthId]);

  // Available unique months list for dropdown filter
  const allAvailableMonths = useMemo(() => {
    const monthMap = new Map<string, string>();
    completedTrips.forEach((trip) => {
      const mId = getMonthId(trip.startTime);
      const title = getMonthTitle(trip.startTime);
      if (!monthMap.has(mId)) {
        monthMap.set(mId, title);
      }
    });
    return Array.from(monthMap.entries())
      .map(([id, title]) => ({ id, title }))
      .sort((a, b) => (b.id > a.id ? 1 : -1));
  }, [completedTrips]);

  const toggleMonthAccordion = (mId: string) => {
    setOpenMonthMap((prev) => {
      const currentVal = prev[mId] !== undefined ? prev[mId] : (mId === currentMonthId || Boolean(search));
      return { ...prev, [mId]: !currentVal };
    });
  };

  const isMonthOpen = (mId: string) => {
    if (openMonthMap[mId] !== undefined) {
      return openMonthMap[mId];
    }
    // Default open if current month or if active search query exists
    return mId === currentMonthId || Boolean(search) || Boolean(selectedMonthFilter);
  };

  const calculateDuration = (startIso: string, endIso?: string) => {
    if (!endIso) return 'Probíhá';
    const start = new Date(startIso).getTime();
    const end = new Date(endIso).getTime();
    const diffSec = Math.max(0, Math.floor((end - start) / 1000));

    const hrs = Math.floor(diffSec / 3600);
    const mins = Math.floor((diffSec % 3600) / 60);

    if (hrs > 0) {
      return `${hrs} h ${mins} min`;
    }
    return `${mins} min`;
  };

  const handleCopySummary = async (trip: Trip) => {
    const dateStr = new Date(trip.startTime).toLocaleDateString('cs-CZ');
    const startStr = new Date(trip.startTime).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
    const endStr = trip.endTime
      ? new Date(trip.endTime).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })
      : 'neuvedeno';

    const text = `JÍZDA DODÁVKOU (${trip.vehiclePlate})
Datum: ${dateStr} (${startStr} - ${endStr})
Stavba: #${formatSiteNumber(trip.siteNumber)} — ${trip.siteName}
${trip.firmName ? `Dodavatel: ${trip.firmName}\n` : ''}Obsah:
${trip.content.split(';').map(i => ` • ${i.trim()}`).join('\n')}
${trip.startKm && trip.endKm ? `Ujeto: ${trip.endKm - trip.startKm} km (${trip.startKm} -> ${trip.endKm} km)` : ''}`;

    await copyToClipboard(text);
    setCopiedId(trip.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCsv = () => {
    if (filteredTrips.length === 0) {
      alert('Žádné jízdy k exportu.');
      return;
    }

    const headers = ['Datum', 'Začátek', 'Konec', 'SPZ', 'Číslo stavby', 'Název stavby', 'Carnet SMS', 'Dodavatel', 'Obsah jízdy', 'Počáteční KM', 'Konečné KM'];
    const csvRows = filteredTrips.map((t) => {
      const d = new Date(t.startTime);
      const dateStr = d.toLocaleDateString('cs-CZ');
      const startStr = d.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
      const endStr = t.endTime ? new Date(t.endTime).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' }) : '';
      return [
        dateStr,
        startStr,
        endStr,
        t.vehiclePlate,
        t.siteNumber,
        `"${t.siteName.replace(/"/g, '""')}"`,
        `"${t.carnetText}"`,
        `"${(t.firmName || '').replace(/"/g, '""')}"`,
        `"${t.content.replace(/"/g, '""')}"`,
        t.startKm || '',
        t.endKm || '',
      ].join(';');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...csvRows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `jizdy_dodavka_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 max-w-full">
      {/* Top Bar with Export / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 shrink-0" />
            Historie jízd ({completedTrips.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Zabaleno přehledně po měsících. Aktuální měsíc je otevřen automatically.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleExportCsv}
            id="btn-export-csv"
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-lg flex items-center gap-2 border border-slate-300 text-xs active:scale-95 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-blue-600 shrink-0" /> Export CSV (Excel)
          </button>

          {completedTrips.length > 0 && (
            <button
              type="button"
              onClick={() => setShowClearAllModal(true)}
              className="p-2.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-lg border border-slate-300 active:scale-95 transition-all text-xs cursor-pointer"
              title="Vymazat celou historii"
            >
              <Trash2 className="w-4 h-4 shrink-0" />
            </button>
          )}
        </div>
      </div>

      {/* Filters Bar with Month Selector */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 shadow-sm">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Hledat v jízdách..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-blue-600 focus:bg-white"
          />
        </div>

        {/* Month Filter */}
        <select
          value={selectedMonthFilter}
          onChange={(e) => setSelectedMonthFilter(e.target.value)}
          className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-blue-600 focus:bg-white font-medium"
        >
          <option value="">🗓️ Všechny měsíce</option>
          {allAvailableMonths.map((m) => (
            <option key={m.id} value={m.id}>
              {m.title} {m.id === currentMonthId ? '(aktuální)' : ''}
            </option>
          ))}
        </select>

        {/* Site Filter */}
        <select
          value={selectedSiteFilter}
          onChange={(e) => setSelectedSiteFilter(e.target.value)}
          className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-blue-600 focus:bg-white font-medium"
        >
          <option value="">🏗️ Všechny stavby</option>
          {[...sites]
            .sort((a, b) => a.name.localeCompare(b.name, 'cs', { sensitivity: 'base' }))
            .map((site) => (
              <option key={site.id} value={site.id}>
                {site.name}
              </option>
            ))}
        </select>

        {/* Firm Filter */}
        <select
          value={selectedFirmFilter}
          onChange={(e) => setSelectedFirmFilter(e.target.value)}
          className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-blue-600 focus:bg-white"
        >
          <option value="">Všichni dodavatelé</option>
          {firms.map((firm) => (
            <option key={firm.id} value={firm.id}>
              {firm.name}
            </option>
          ))}
        </select>
      </div>

      {/* Trip List grouped by monthly accordions */}
      {monthGroups.length === 0 ? (
        <div className="p-8 bg-white rounded-xl border border-slate-200 text-center space-y-2 shadow-sm">
          <History className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-slate-700 text-sm font-semibold">Žádné odjeté jízdy v záznamu.</p>
          <p className="text-xs text-slate-500">
            {completedTrips.length > 0 ? 'Zkuste změnit filtry vyhledávání.' : 'Zahajte a ukončete první jízdu tlačítkem v menu "Zahájit jízdu".'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {monthGroups.map((group) => {
            const isOpen = isMonthOpen(group.monthId);
            const totalKmInMonth = group.trips.reduce((acc, trip) => {
              if (trip.startKm !== undefined && trip.endKm !== undefined) {
                return acc + (trip.endKm - trip.startKm);
              }
              return acc;
            }, 0);

            return (
              <div
                key={group.monthId}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-all"
              >
                {/* Accordion Month Header */}
                <button
                  type="button"
                  onClick={() => toggleMonthAccordion(group.monthId)}
                  className={`w-full p-4 sm:p-4.5 flex items-center justify-between gap-3 text-left transition-all cursor-pointer ${
                    isOpen
                      ? 'bg-slate-900 text-white hover:bg-slate-800'
                      : 'bg-slate-50 text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-xl shrink-0 ${
                        isOpen ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border border-slate-200'
                      }`}
                    >
                      <Calendar className="w-5 h-5" />
                    </div>

                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-black truncate">{group.monthTitle}</h3>
                        {group.isCurrentMonth && (
                          <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md ${
                            isOpen ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-800'
                          }`}>
                            Aktuální
                          </span>
                        )}
                      </div>
                      <div className={`text-xs mt-0.5 ${isOpen ? 'text-slate-300' : 'text-slate-500'}`}>
                        {group.trips.length} {group.trips.length === 1 ? 'jízda' : (group.trips.length >= 2 && group.trips.length <= 4 ? 'jízdy' : 'jízd')}
                        {totalKmInMonth > 0 && ` • celkem +${totalKmInMonth} km`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                      isOpen ? 'bg-slate-800 text-slate-200' : 'bg-white text-slate-700 border border-slate-200'
                    }`}>
                      {isOpen ? 'Zabalit' : 'Rozbalit'}
                    </span>
                    {isOpen ? (
                      <ChevronDown className="w-5 h-5 opacity-80" />
                    ) : (
                      <ChevronRight className="w-5 h-5 opacity-80" />
                    )}
                  </div>
                </button>

                {/* Collapsible Month Body */}
                {isOpen && (
                  <div className="p-3 sm:p-5 space-y-4 bg-slate-50/50 border-t border-slate-200">
                    {group.trips.map((trip) => {
                      const startDate = new Date(trip.startTime);
                      const endDate = trip.endTime ? new Date(trip.endTime) : null;
                      const fullDayDateHeader = formatCzechDayAndDate(trip.startTime);
                      const relativeBadge = getRelativeDateBadge(trip.startTime);
                      const startStr = startDate.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
                      const endStr = endDate ? endDate.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' }) : '—';
                      const durationStr = calculateDuration(trip.startTime, trip.endTime);
                      const isCopied = copiedId === trip.id;
                      const distance = trip.startKm && trip.endKm ? trip.endKm - trip.startKm : null;
                      const siteData = sites.find((s) => s.id === trip.siteId);

                      return (
                        <div
                          key={trip.id}
                          className="bg-white border-2 border-slate-200 hover:border-sky-300 rounded-2xl p-4 sm:p-5 space-y-4 transition-all shadow-sm max-w-full"
                        >
                          {/* Clear Header Block: Day & Date heading + Relative time badge */}
                          <div className="bg-gradient-to-r from-sky-50/80 via-blue-50/40 to-slate-50 p-3.5 sm:p-4 rounded-xl border border-sky-100 space-y-2.5">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <span className="text-xs font-bold text-slate-500 block mb-1">
                                  {fullDayDateHeader}
                                </span>

                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${relativeBadge.color}`}>
                                    {relativeBadge.label}
                                  </span>
                                  <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2.5 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                                    <Clock className="w-3 h-3 inline mr-1 text-slate-500" />
                                    {startStr} – {endStr} ({durationStr})
                                  </span>
                                  <span className="font-mono text-xs font-black bg-blue-100 text-blue-900 px-2 py-0.5 rounded-md border border-blue-200">
                                    {trip.vehiclePlate}
                                  </span>
                                </div>
                              </div>

                              {/* Action buttons */}
                              <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                                {onUpdateTrip && (
                                  <button
                                    type="button"
                                    onClick={() => setEditingTrip(trip)}
                                    className="px-2.5 py-1.5 text-xs font-bold text-blue-800 bg-white hover:bg-blue-50 rounded-lg border border-blue-200 shadow-2xs transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                                    title="Upravit jízdu"
                                  >
                                    <Pencil className="w-3.5 h-3.5 text-blue-600 shrink-0" /> <span className="hidden sm:inline">Upravit</span>
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleCopySummary(trip)}
                                  className="p-1.5 text-slate-600 hover:text-blue-600 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-all text-xs flex items-center gap-1 cursor-pointer active:scale-95"
                                  title="Zkopírovat souhrn jízdy"
                                >
                                  {isCopied ? <Check className="w-4 h-4 text-emerald-600 shrink-0" /> : <Copy className="w-4 h-4 shrink-0" />}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeletingTripId(trip.id)}
                                  className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg bg-white hover:bg-rose-50 border border-slate-200 shadow-2xs transition-all cursor-pointer active:scale-95"
                                  title="Smazat jízdu"
                                >
                                  <Trash2 className="w-4 h-4 shrink-0" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Main trip info grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* Site */}
                            <div className="flex flex-col justify-between space-y-2 min-w-0">
                              <SiteTripHeader
                                siteNumber={trip.siteNumber}
                                siteName={trip.siteName}
                                siteOwner={trip.siteOwner || siteData?.owner}
                                sitePhone={trip.sitePhone || siteData?.phone}
                                siteManager={trip.siteManager || siteData?.siteManager}
                                siteManagerPhone={trip.siteManagerPhone || siteData?.siteManagerPhone}
                                contactPerson={trip.siteContactPerson || siteData?.contactPerson}
                                contactPhone={trip.siteContactPhone || siteData?.contactPhone}
                              />
                            </div>

                            {/* Supplier Firm */}
                            <div className="flex flex-col justify-between bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2 min-w-0">
                              <div className="flex items-start gap-2 w-full min-w-0">
                                <Building2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                                <div className="w-full space-y-1.5 min-w-0">
                                  <div className="text-[11px] text-slate-500 font-bold uppercase">Vyzvednutí v firmách</div>
                                  {trip.firmName ? (
                                    <div className="flex flex-col gap-1.5 mt-0.5 w-full min-w-0">
                                      {(() => {
                                        const firmIdList = trip.firmIds && trip.firmIds.length > 0
                                          ? trip.firmIds
                                          : (trip.firmId ? [trip.firmId] : []);
                                        
                                        const firmNamesList = trip.firmNames && trip.firmNames.length > 0
                                          ? trip.firmNames
                                          : (trip.firmName ? trip.firmName.split(', ') : []);

                                        if (firmIdList.length > 0) {
                                          return firmIdList.map((fId) => {
                                            const matchedFirm = firms?.find((f) => f.id === fId);
                                            const fName = matchedFirm?.name || fId;
                                            const fColor = matchedFirm?.color || trip.firmColor || '#4f46e5';
                                            const fPhone = matchedFirm?.phone;
                                            return (
                                              <div
                                                key={fId}
                                                className="flex flex-col gap-1.5 text-xs font-bold p-2.5 rounded-lg text-slate-900 border bg-white min-w-0 w-full shadow-2xs"
                                                style={{
                                                  borderColor: `${fColor}40`,
                                                  backgroundColor: `${fColor}08`,
                                                }}
                                              >
                                                <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900 truncate">
                                                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: fColor }} />
                                                  <span className="truncate">{fName}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 pt-1 border-t border-slate-200/60 flex-wrap">
                                                  <MapLinkButton
                                                    mapUrl={matchedFirm?.mapUrl}
                                                    address={matchedFirm?.address}
                                                    firmName={fName}
                                                    variant="button"
                                                    label="Zobrazit na mapě"
                                                    className="text-[10px] py-0.5 px-2"
                                                  />
                                                  {fPhone && <PhoneCallLink phone={fPhone} variant="button" label="Volat" className="text-[10px] py-0.5" />}
                                                </div>
                                              </div>
                                            );
                                          });
                                        }

                                        return firmNamesList.map((name, idx) => {
                                          const matchedFirm = firms?.find((f) => f.name.toLowerCase() === name.toLowerCase());
                                          return (
                                            <div
                                              key={idx}
                                              className="flex flex-col gap-1.5 text-xs font-bold p-2.5 rounded-lg text-slate-900 border bg-white min-w-0 w-full shadow-2xs"
                                              style={{
                                                borderColor: `${trip.firmColor || '#3b82f6'}40`,
                                                backgroundColor: `${trip.firmColor || '#3b82f6'}08`,
                                              }}
                                            >
                                              <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900 truncate">
                                                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: trip.firmColor || '#3b82f6' }} />
                                                <span className="truncate">{name}</span>
                                              </div>
                                              <div className="flex items-center gap-1.5 pt-1 border-t border-slate-200/60 flex-wrap">
                                                <MapLinkButton
                                                  mapUrl={matchedFirm?.mapUrl}
                                                  address={matchedFirm?.address}
                                                  firmName={name}
                                                  variant="button"
                                                  label="Zobrazit na mapě"
                                                  className="text-[10px] py-0.5 px-2"
                                                />
                                                {matchedFirm?.phone && <PhoneCallLink phone={matchedFirm.phone} variant="button" label="Volat" className="text-[10px] py-0.5" />}
                                              </div>
                                            </div>
                                          );
                                        });
                                      })()}
                                    </div>
                                  ) : (
                                    <span className="text-xs text-slate-500 italic">Bez mezipřistání v firmě</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Content description rendered with semicolon auto-formatting */}
                          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1 min-w-0">
                            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-blue-600 shrink-0" /> Popis a úkoly jízdy:
                            </div>
                            <RenderTripContent content={trip.content} opRecords={opRecords} onOpenOP={onOpenOP} />
                          </div>

                          {/* Kilometer stats if logged */}
                          {(trip.startKm !== undefined || trip.endKm !== undefined) && (
                            <div className="flex items-center gap-3 sm:gap-4 text-xs font-mono text-slate-600 px-1 pt-1 flex-wrap">
                              <Gauge className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>Start: <strong className="text-slate-900">{trip.startKm ?? '—'} km</strong></span>
                              <span>Konec: <strong className="text-slate-900">{trip.endKm ?? '—'} km</strong></span>
                              {distance !== null && (
                                <span className="text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                                  +{distance} km
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Single Trip Delete Modal */}
      {deletingTripId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Smazat jízdu?</h3>
            </div>
            <p className="text-sm text-slate-700">
              Opravdu chcete vymazat tuto jízdu z historie?
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  onDeleteTrip(deletingTripId);
                  setDeletingTripId(null);
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm transition-all active:scale-95 shadow-sm cursor-pointer"
              >
                Ano, smazat
              </button>
              <button
                type="button"
                onClick={() => setDeletingTripId(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm border border-slate-300 transition-all cursor-pointer"
              >
                Zrušit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Trips Modal */}
      {showClearAllModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Vymazat celou historii?</h3>
            </div>
            <p className="text-sm text-slate-700">
              Opravdu chcete trvale smazat všech <strong className="font-bold">{completedTrips.length}</strong> odjetých jízd? Tato akce je nevratná.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  onClearAllTrips();
                  setShowClearAllModal(false);
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm transition-all active:scale-95 shadow-sm cursor-pointer"
              >
                Ano, smazat celou historii
              </button>
              <button
                type="button"
                onClick={() => setShowClearAllModal(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm border border-slate-300 transition-all cursor-pointer"
              >
                Zrušit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Trip Modal */}
      {editingTrip && onUpdateTrip && (
        <EditTripModal
          trip={editingTrip}
          sites={sites}
          firms={firms}
          opRecords={opRecords}
          onOpenOP={onOpenOP}
          onSave={onUpdateTrip}
          onClose={() => setEditingTrip(null)}
        />
      )}
    </div>
  );
};
