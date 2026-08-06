import React from 'react';
import { Truck, User, UserCheck, HardHat } from 'lucide-react';
import { PhoneCallLink } from './PhoneCallLink';
import { formatSiteNumber } from '../utils/storage';

interface SiteTripHeaderProps {
  siteNumber: string;
  siteName: string;
  siteOwner?: string;
  sitePhone?: string;
  siteManager?: string;
  siteManagerPhone?: string;
  contactPerson?: string;
  contactPhone?: string;
  className?: string;
}

export const SiteTripHeader: React.FC<SiteTripHeaderProps> = ({
  siteNumber,
  siteName,
  siteOwner,
  sitePhone,
  siteManager,
  siteManagerPhone,
  contactPerson,
  contactPhone,
  className = '',
}) => {
  const actualContactPerson = contactPerson || siteManager || siteOwner || 'Osoba na stavbě';
  const actualContactPhone = contactPhone || siteManagerPhone || sitePhone || '';

  return (
    <div
      className={`bg-slate-900 text-white rounded-xl p-3.5 border border-slate-800 shadow-md space-y-2.5 relative overflow-hidden w-full max-w-full ${className}`}
    >
      {/* Background watermark van icon */}
      <Truck className="absolute -right-2 -bottom-2 w-16 h-16 text-white/5 pointer-events-none rotate-12" />

      {/* Radek 1: Název stavby */}
      <div className="flex items-center gap-2 min-w-0">
        <Truck className="w-4 h-4 text-blue-400 shrink-0" />
        <h3 className="text-base sm:text-lg font-black text-white tracking-tight truncate">
          {siteName}
        </h3>
      </div>

      {/* Radek 2: Číslo stavby */}
      <div className="text-xs text-slate-300 flex items-center gap-1.5 font-mono">
        <span className="text-slate-400 font-sans text-xs">Číslo stavby:</span>
        <span className="font-extrabold bg-blue-500/30 text-blue-200 border border-blue-400/40 px-2 py-0.5 rounded text-xs">
          #{formatSiteNumber(siteNumber)}
        </span>
      </div>

      {/* Radek 3: Kontakt na vlastníka stavby (Jméno samostatně, pod ním telefon) */}
      <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/80 space-y-1.5 text-xs">
        <div className="flex items-center gap-1.5 text-blue-300">
          <User className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span className="text-slate-300 font-medium">Vlastník stavby:</span>
          <strong className="text-white font-bold truncate">{siteOwner || 'Neuveden'}</strong>
        </div>
        <div className="flex items-center justify-between gap-2 pl-5 pt-0.5 border-t border-slate-700/50">
          <span className="text-slate-300 font-mono text-[11px]">
            Tel: <strong className="text-white font-bold">{sitePhone || 'Nezadaný'}</strong>
          </span>
          {sitePhone ? (
            <PhoneCallLink phone={sitePhone} variant="button" label="Zavolat" className="py-0.5 px-2 text-[10px] shrink-0" />
          ) : (
            <span className="text-[10px] text-slate-500 italic shrink-0">Bez tel.</span>
          )}
        </div>
      </div>

      {/* Radek 4: Kontakt na stavbě (Jméno samostatně, pod ním telefon) */}
      <div className="bg-emerald-950/60 p-2.5 rounded-lg border border-emerald-800/60 space-y-1.5 text-xs">
        <div className="flex items-center gap-1.5 text-emerald-300">
          <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="text-emerald-200/80 font-medium">Kontakt na stavbě:</span>
          <strong className="text-white font-bold truncate">{actualContactPerson}</strong>
        </div>
        <div className="flex items-center justify-between gap-2 pl-5 pt-0.5 border-t border-emerald-800/40">
          <span className="text-emerald-100 font-mono text-[11px]">
            Tel: <strong className="text-white font-bold">{actualContactPhone || 'Nezadaný'}</strong>
          </span>
          {actualContactPhone ? (
            <PhoneCallLink
              phone={actualContactPhone}
              variant="button"
              label="Zavolat"
              className="py-0.5 px-2 text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white border-0 shrink-0"
            />
          ) : (
            <span className="text-[10px] text-slate-500 italic shrink-0">Bez tel.</span>
          )}
        </div>
      </div>
    </div>
  );
};

