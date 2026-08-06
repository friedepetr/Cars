import React from 'react';
import { Play, History, Building, Building2, Settings, Truck, FileText } from 'lucide-react';
import { Trip } from '../types';

export type NavTab = 'start' | 'history' | 'sites' | 'firms' | 'settings';

interface NavbarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeTrip: Trip | null;
  sitesCount: number;
  firmsCount: number;
  completedTripsCount: number;
  vehiclePlate: string;
  opCount?: number;
  onOpenOPManager?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  activeTrip,
  sitesCount,
  firmsCount,
  completedTripsCount,
  vehiclePlate,
  opCount = 0,
  onOpenOPManager,
}) => {
  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-sky-100 px-3 sm:px-5 pt-safe-top pb-3 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 cursor-pointer min-w-0" onClick={() => onSelectTab('start')}>
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-500 to-blue-700 flex items-center justify-center text-white font-black shadow-md shadow-blue-500/25 shrink-0 active:scale-95 transition-transform">
              <Truck className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight tracking-tight flex items-center gap-1.5 flex-wrap">
                <span className="truncate">LOGISTIKA TRIP-LOG</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-sky-100 text-blue-800 border border-sky-200 font-extrabold shrink-0">
                  EVIDENCE
                </span>
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-500 font-mono truncate">
                DODÁVKA: <strong className="text-blue-700 font-black">{vehiclePlate || '6AH 5297'}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Active trip indicator banner if running */}
            {activeTrip && (
              <button
                type="button"
                onClick={() => onSelectTab('start')}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 border border-emerald-300/80 px-2.5 sm:px-3 py-1.5 rounded-xl shadow-xs animate-pulse shrink-0 cursor-pointer"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <div className="text-left">
                  <div className="text-[9px] sm:text-[10px] uppercase font-black text-emerald-800 tracking-wider">PROBÍHÁ JÍZDA</div>
                  <div className="text-xs font-mono font-black text-emerald-950">#{activeTrip.siteNumber}</div>
                </div>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Desktop Navigation */}
      <nav className="hidden md:block bg-white border-b border-slate-200 px-4 py-2 sticky top-[61px] z-30 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-center gap-2">
          <button
            type="button"
            id="tab-nav-start"
            onClick={() => onSelectTab('start')}
            className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
              activeTab === 'start'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Play className={`w-4 h-4 ${activeTab === 'start' ? 'fill-white' : ''}`} />
            {activeTrip ? 'Probíhající jízda' : 'Zahájit jízdu'}
            {activeTrip && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}
          </button>

          <button
            type="button"
            id="tab-nav-history"
            onClick={() => onSelectTab('history')}
            className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4" />
            Historie jízd
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-mono">
              {completedTripsCount}
            </span>
          </button>

          <button
            type="button"
            id="tab-nav-sites"
            onClick={() => onSelectTab('sites')}
            className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
              activeTab === 'sites'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Building className="w-4 h-4" />
            Stavby
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-mono">
              {sitesCount}
            </span>
          </button>

          <button
            type="button"
            id="tab-nav-firms"
            onClick={() => onSelectTab('firms')}
            className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
              activeTab === 'firms'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Dodavatelé
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-mono">
              {firmsCount}
            </span>
          </button>

          <button
            type="button"
            id="tab-nav-settings"
            onClick={() => onSelectTab('settings')}
            className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
              activeTab === 'settings'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            Nastavení
          </button>
        </div>
      </nav>

      {/* Touch-Friendly Bottom Mobile Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/98 backdrop-blur-lg border-t border-slate-200 px-1 pt-2 pb-safe-bottom shadow-2xl shadow-slate-900/20">
        <div className="grid grid-cols-5 gap-1 max-w-md mx-auto">
          <button
            type="button"
            onClick={() => onSelectTab('start')}
            className={`flex flex-col items-center justify-center min-h-[46px] py-1 px-0.5 rounded-2xl transition-all active:scale-95 ${
              activeTab === 'start'
                ? 'bg-gradient-to-b from-blue-600 to-sky-600 text-white font-extrabold shadow-sm shadow-blue-500/30'
                : 'text-slate-600 hover:text-blue-600 hover:bg-sky-50/60'
            }`}
          >
            <div className="relative">
              <Play className={`w-5 h-5 ${activeTab === 'start' ? 'fill-white text-white' : ''}`} />
              {activeTrip && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping border-2 border-white" />
              )}
            </div>
            <span className="text-[10px] font-bold mt-0.5 tracking-tight truncate w-full text-center">
              {activeTrip ? 'Probíhá' : 'Jízda'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('history')}
            className={`flex flex-col items-center justify-center min-h-[46px] py-1 px-0.5 rounded-2xl transition-all active:scale-95 ${
              activeTab === 'history'
                ? 'bg-gradient-to-b from-blue-600 to-sky-600 text-white font-extrabold shadow-sm shadow-blue-500/30'
                : 'text-slate-600 hover:text-blue-600 hover:bg-sky-50/60'
            }`}
          >
            <History className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-0.5 tracking-tight truncate w-full text-center">Historie</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('sites')}
            className={`flex flex-col items-center justify-center min-h-[46px] py-1 px-0.5 rounded-2xl transition-all active:scale-95 ${
              activeTab === 'sites'
                ? 'bg-gradient-to-b from-blue-600 to-sky-600 text-white font-extrabold shadow-sm shadow-blue-500/30'
                : 'text-slate-600 hover:text-blue-600 hover:bg-sky-50/60'
            }`}
          >
            <Building className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-0.5 tracking-tight truncate w-full text-center">Stavby</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('firms')}
            className={`flex flex-col items-center justify-center min-h-[46px] py-1 px-0.5 rounded-2xl transition-all active:scale-95 ${
              activeTab === 'firms'
                ? 'bg-gradient-to-b from-blue-600 to-sky-600 text-white font-extrabold shadow-sm shadow-blue-500/30'
                : 'text-slate-600 hover:text-blue-600 hover:bg-sky-50/60'
            }`}
          >
            <Building2 className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-0.5 tracking-tight truncate w-full text-center">Firmy</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('settings')}
            className={`flex flex-col items-center justify-center min-h-[46px] py-1 px-0.5 rounded-2xl transition-all active:scale-95 ${
              activeTab === 'settings'
                ? 'bg-gradient-to-b from-blue-600 to-sky-600 text-white font-extrabold shadow-sm shadow-blue-500/30'
                : 'text-slate-600 hover:text-blue-600 hover:bg-sky-50/60'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-0.5 tracking-tight truncate w-full text-center">Nastavení</span>
          </button>
        </div>
      </nav>
    </>
  );
};
