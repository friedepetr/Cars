import React, { useState } from 'react';
import { Building, Plus, Trash2, Edit2, Phone, User, Copy, Check, Search, Hash, X } from 'lucide-react';
import { Site } from '../types';
import { formatCarnetSms, copyToClipboard, formatSiteNumber } from '../utils/storage';
import { PhoneCallLink } from './PhoneCallLink';

interface SitesManagerProps {
  sites: Site[];
  vehiclePlate: string;
  onAddSite: (site: Omit<Site, 'id' | 'createdAt'>) => void;
  onUpdateSite: (site: Site) => void;
  onDeleteSite: (id: string) => void;
}

export const SitesManager: React.FC<SitesManagerProps> = ({
  sites,
  vehiclePlate,
  onAddSite,
  onUpdateSite,
  onDeleteSite,
}) => {
  const [search, setSearch] = useState('');
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingSite, setDeletingSite] = useState<Site | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Form fields
  const [number, setNumber] = useState('');
  const [name, setName] = useState('');
  const [owner, setOwner] = useState('');
  const [phone, setPhone] = useState('');

  const resetForm = () => {
    setNumber('');
    setName('');
    setOwner('');
    setPhone('');
    setEditingSite(null);
    setIsAdding(false);
    setValidationError(null);
  };

  const openAdd = () => {
    resetForm();
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openEdit = (site: Site) => {
    setEditingSite(site);
    setNumber(site.number);
    setName(site.name);
    setOwner(site.owner || '');
    setPhone(site.phone || '');
    setIsAdding(true);
    setValidationError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !number.trim()) {
      setValidationError('Vyplňte prosím název a číslo stavby.');
      return;
    }

    setValidationError(null);

    if (editingSite) {
      onUpdateSite({
        ...editingSite,
        number: number.trim(),
        name: name.trim(),
        owner: owner.trim(),
        phone: phone.trim(),
      });
    } else {
      onAddSite({
        number: number.trim(),
        name: name.trim(),
        owner: owner.trim(),
        phone: phone.trim(),
      });
    }

    resetForm();
  };

  const handleCopyCarnet = async (siteNumber: string, id: string) => {
    const text = formatCarnetSms(vehiclePlate, siteNumber);
    await copyToClipboard(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredSites = [...sites]
    .filter(
      (s) =>
        s.number.toLowerCase().includes(search.toLowerCase()) ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.owner && s.owner.toLowerCase().includes(search.toLowerCase())) ||
        (s.phone && s.phone.includes(search))
    )
    .sort((a, b) => a.name.localeCompare(b.name, 'cs', { sensitivity: 'base' }));

  return (
    <div className="space-y-6 max-w-full">
      {/* Top Header */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Building className="w-6 h-6 text-blue-600 shrink-0" />
          Správa staveb ({sites.length})
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Seznam staveb s názvem, číslem, vlastníkem a telefonním kontaktem (seřazeno abecedně A–Z).
        </p>
      </div>

      {/* Add / Edit Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white border-2 border-blue-500 p-5 rounded-xl space-y-4 animate-fade-in shadow-md">
          <div className="flex justify-between items-center border-b border-slate-200 pb-3">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600 shrink-0" />
              {editingSite ? `Úprava stavby ${editingSite.name}` : 'Nová stavba'}
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-all cursor-pointer"
            >
              Zrušit
            </button>
          </div>

          {validationError && (
            <div className="bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold p-3 rounded-lg flex items-center gap-2">
              <X className="w-4 h-4 text-rose-600 shrink-0" /> {validationError}
            </div>
          )}

          <div className="space-y-4">
            {/* 1. Název stavby */}
            <div>
              <label htmlFor="site-name" className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-blue-600" /> Název stavby *
              </label>
              <input
                id="site-name"
                type="text"
                required
                placeholder="např. Bytový dům Parková"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 focus:bg-white rounded-lg p-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 text-sm font-semibold"
              />
            </div>

            {/* 2. Číslo stavby */}
            <div>
              <label htmlFor="site-number" className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-blue-600" /> Číslo stavby *
              </label>
              <input
                id="site-number"
                type="text"
                required
                placeholder="např. 104/2026 nebo 52"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 focus:bg-white rounded-lg p-2.5 text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:border-blue-600 text-sm"
              />
            </div>

            {/* 3. Vlastník */}
            <div>
              <label htmlFor="site-owner" className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-blue-600" /> Vlastník stavby
              </label>
              <input
                id="site-owner"
                type="text"
                placeholder="např. Metrostav Development a.s."
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 focus:bg-white rounded-lg p-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 text-sm"
              />
            </div>

            {/* 4. Telefon */}
            <div>
              <label htmlFor="site-phone" className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-blue-600" /> Telefonní číslo
              </label>
              <input
                id="site-phone"
                type="text"
                placeholder="např. +420 602 123 456"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 focus:bg-white rounded-lg p-2.5 text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:border-blue-600 text-sm"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2 flex-wrap">
            <button
              type="submit"
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              {editingSite ? 'Uložit změny' : 'Vytvořit a uložit stavbu'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-sm border border-slate-300 transition-all cursor-pointer"
            >
              Zrušit
            </button>
          </div>
        </form>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Hledat podle názvu, čísla stavby, vlastníka nebo telefonu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-300 rounded-lg pl-11 pr-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 text-sm shadow-xs"
        />
      </div>

      {/* Sites List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSites.map((site) => {
          return (
            <div
              key={site.id}
              className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-4 transition-all shadow-xs hover:shadow-md group max-w-full"
            >
              <div className="space-y-3">
                {/* 1. Název stavby + Akce (Edit/Delete) */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 break-words leading-tight">
                    {site.name}
                  </h3>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEdit(site)}
                      title="Upravit stavbu"
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingSite(site)}
                      title="Odstranit stavbu"
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 2. Číslo stavby */}
                <div className="text-xs text-slate-600 flex items-center gap-2">
                  <span className="text-slate-400 font-medium shrink-0">Číslo stavby:</span>
                  <span className="font-mono font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-xs">
                    #{formatSiteNumber(site.number)}
                  </span>
                </div>

                {/* 3. Vlastník */}
                <div className="text-xs text-slate-600 flex items-center gap-2">
                  <span className="text-slate-400 font-medium shrink-0">Vlastník:</span>
                  <strong className="text-slate-900 font-bold truncate">
                    {site.owner || 'Nezadaný'}
                  </strong>
                </div>

                {/* 4. Telefon s možností zavolat */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                  <div className="text-xs text-slate-600 flex items-center gap-2 font-mono">
                    <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Telefon: <strong className="text-slate-900 text-sm font-bold">{site.phone || 'Nezadaný'}</strong></span>
                  </div>
                  {site.phone && (
                    <div className="pt-0.5">
                      <PhoneCallLink phone={site.phone} variant="button" label="Zavolat" />
                    </div>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Floating Action Button for adding new site */}
      {!isAdding && (
        <button
          type="button"
          onClick={openAdd}
          id="btn-add-new-site"
          title="Přidat novou stavbu"
          className="fixed bottom-fab-position right-4 sm:bottom-8 sm:right-8 z-40 bg-blue-600 hover:bg-blue-700 text-white font-black p-4 sm:px-5 sm:py-3.5 rounded-full shadow-2xl flex items-center justify-center gap-2 transition-all active:scale-90 cursor-pointer border-2 border-blue-400/40"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
          <span className="hidden sm:inline text-sm font-bold">Přidat stavbu</span>
        </button>
      )}

      {/* Delete Confirmation Modal */}
      {deletingSite && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Smazat stavbu?</h3>
            </div>

            <p className="text-sm text-slate-700">
              Opravdu chcete smazat stavbu{' '}
              <strong className="text-slate-900 font-bold">{siteNameAndNum(deletingSite)}</strong>?
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  onDeleteSite(deletingSite.id);
                  setDeletingSite(null);
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm transition-all active:scale-95 shadow-xs cursor-pointer"
              >
                Ano, smazat
              </button>
              <button
                type="button"
                onClick={() => setDeletingSite(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm border border-slate-300 transition-all cursor-pointer"
              >
                Zrušit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function siteNameAndNum(s: Site): string {
  return `#${formatSiteNumber(s.number)} — ${s.name}`;
}


