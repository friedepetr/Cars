import React, { useState } from 'react';
import { Building2, Plus, Trash2, Edit2, MapPin, Phone, Search, Palette, Check, ExternalLink } from 'lucide-react';
import { SupplierFirm } from '../types';
import { PhoneCallLink } from './PhoneCallLink';
import { MapLinkButton } from './MapLinkButton';

interface FirmsManagerProps {
  firms: SupplierFirm[];
  onAddFirm: (firm: Omit<SupplierFirm, 'id' | 'createdAt'>) => void;
  onUpdateFirm: (firm: SupplierFirm) => void;
  onDeleteFirm: (id: string) => void;
}

const COLOR_PRESETS = [
  { name: 'Červená', hex: '#ef4444' },
  { name: 'Modrá', hex: '#3b82f6' },
  { name: 'Oranžová', hex: '#f59e0b' },
  { name: 'Zelená', hex: '#10b981' },
  { name: 'Fialová', hex: '#8b5cf6' },
  { name: 'Růžová', hex: '#ec4899' },
  { name: 'Tyrkysová', hex: '#14b8a6' },
  { name: 'Žlutá', hex: '#eab308' },
  { name: 'Šedá', hex: '#64748b' },
];

export const FirmsManager: React.FC<FirmsManagerProps> = ({
  firms,
  onAddFirm,
  onUpdateFirm,
  onDeleteFirm,
}) => {
  const [search, setSearch] = useState('');
  const [editingFirm, setEditingFirm] = useState<SupplierFirm | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [deletingFirm, setDeletingFirm] = useState<SupplierFirm | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [color, setColor] = useState('#ef4444');
  const [address, setAddress] = useState('');
  const [mapUrl, setMapUrl] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  const resetForm = () => {
    setName('');
    setColor('#ef4444');
    setAddress('');
    setMapUrl('');
    setPhone('');
    setNotes('');
    setEditingFirm(null);
    setIsAdding(false);
  };

  const openAdd = () => {
    resetForm();
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openEdit = (firm: SupplierFirm) => {
    setEditingFirm(firm);
    setName(firm.name);
    setColor(firm.color || '#ef4444');
    setAddress(firm.address || '');
    setMapUrl(firm.mapUrl || '');
    setPhone(firm.phone || '');
    setNotes(firm.notes || '');
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Zadejte prosím název firmy.');
      return;
    }

    if (editingFirm) {
      onUpdateFirm({
        ...editingFirm,
        name: name.trim(),
        color,
        address: address.trim(),
        mapUrl: mapUrl.trim(),
        phone: phone.trim(),
        notes: notes.trim(),
      });
    } else {
      onAddFirm({
        name: name.trim(),
        color,
        address: address.trim(),
        mapUrl: mapUrl.trim(),
        phone: phone.trim(),
        notes: notes.trim(),
      });
    }

    resetForm();
  };

  const filteredFirms = firms
    .filter((f) => {
      const s = search.toLowerCase();
      return (
        f.name.toLowerCase().includes(s) ||
        (f.address && f.address.toLowerCase().includes(s)) ||
        (f.phone && f.phone.includes(s))
      );
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'cs', { sensitivity: 'base' }));

  return (
    <div className="space-y-6 relative pb-16">
      {/* Top Header */}
      <div className="bg-[#141414] p-4 sm:p-5 rounded-xl border border-white/10 shadow-lg">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Building2 className="w-6 h-6 text-blue-400" />
          Dodavatelské firmy ({firms.length})
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Seznam dodavatelů a prodejců stavebního materiálu (seřazeno abecedně A–Z).
        </p>
      </div>

      {/* Add / Edit Form Drawer */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-[#141414] border border-blue-500/60 p-5 rounded-xl space-y-4 animate-fade-in shadow-xl">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-400" />
              {editingFirm ? `Úprava firmy: ${editingFirm.name}` : 'Nová dodavatelská firma'}
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-gray-400 hover:text-white px-2.5 py-1.5 rounded bg-[#1A1A1A] cursor-pointer"
            >
              Zrušit
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="firm-name" className="block text-xs font-bold text-gray-300 mb-1">
                Název firmy *
              </label>
              <input
                id="firm-name"
                type="text"
                required
                placeholder="např. DEK Stavebniny, Hornbach, Elektro Horák"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg p-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>

            {/* Color Tag Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-2 flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-blue-400" /> Barevný štítek pro přehlednost *
              </label>
              <div className="flex flex-wrap gap-2 items-center">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => setColor(preset.hex)}
                    title={preset.name}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      color === preset.hex ? 'ring-4 ring-white scale-110 shadow-lg' : 'hover:scale-105 opacity-80'
                    }`}
                    style={{ backgroundColor: preset.hex }}
                  >
                    {color === preset.hex && <Check className="w-5 h-5 text-white drop-shadow-md stroke-[3]" />}
                  </button>
                ))}
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-9 h-9 rounded-lg bg-transparent border-0 cursor-pointer"
                  title="Vlastní barva"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firm-address" className="block text-xs font-bold text-gray-300 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" /> Adresa pobočky / skladu
                </label>
                <input
                  id="firm-address"
                  type="text"
                  placeholder="např. Vysočanská 55, Praha 9"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg p-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label htmlFor="firm-map-url" className="block text-xs font-bold text-gray-300 mb-1 flex items-center gap-1">
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-400" /> Odkaz z Mapy.cz / Google Maps (volitelné)
                </label>
                <input
                  id="firm-map-url"
                  type="url"
                  placeholder="např. https://mapy.cz/s/heslo"
                  value={mapUrl}
                  onChange={(e) => setMapUrl(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg p-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 text-sm font-mono"
                />
              </div>
            </div>

            <div>
              <label htmlFor="firm-phone" className="block text-xs font-bold text-gray-300 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-gray-400" /> Telefonní číslo
              </label>
              <input
                id="firm-phone"
                type="text"
                placeholder="např. +420 800 111 222"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg p-2.5 text-white font-mono placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>

            <div>
              <label htmlFor="firm-notes" className="block text-xs font-bold text-gray-300 mb-1">
                Poznámka / Instrukce pro výdej
              </label>
              <input
                id="firm-notes"
                type="text"
                placeholder="např. Příjezd u Drive-in z boku, platba na účet stavby"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg p-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-sm active:scale-95 transition-all cursor-pointer"
            >
              {editingFirm ? 'Uložit změny firmy' : 'Uložit novou firmu'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-3 bg-[#1A1A1A] hover:bg-white/10 text-gray-300 font-semibold rounded-lg text-sm border border-white/10 cursor-pointer"
            >
              Zrušit
            </button>
          </div>
        </form>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-3.5 top-3 text-gray-400" />
        <input
          type="text"
          placeholder="Hledat firmu podle názvu, adresy nebo telefonu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#141414] border border-white/10 rounded-lg pl-11 pr-4 py-2.5 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
        />
      </div>

      {/* Firms List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFirms.map((firm) => (
          <div
            key={firm.id}
            className="bg-[#141414] border border-white/10 rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-4 transition-all shadow-md group"
          >
            <div className="space-y-3">
              {/* Header: Color + Firm Name + Actions */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-5 h-5 rounded-full inline-block border-2 border-white/30 shrink-0 shadow"
                    style={{ backgroundColor: firm.color || '#3b82f6' }}
                  />
                  <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                    {firm.name}
                  </h3>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEdit(firm)}
                    title="Upravit firmu"
                    className="p-2 text-gray-400 hover:text-blue-400 rounded-lg hover:bg-[#1A1A1A] active:scale-95 transition-all cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingFirm(firm)}
                    title="Odstranit firmu"
                    className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-[#1A1A1A] active:scale-95 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Section 1: Address and Button 'Zobrazit na mapě' */}
              <div className="bg-[#1A1A1A] p-3 rounded-lg border border-white/5 space-y-2">
                <div className="text-xs text-gray-200 flex items-start gap-1.5 font-medium leading-relaxed">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{firm.address || 'Adresa nezadaná'}</span>
                </div>
                <div className="pt-0.5">
                  <MapLinkButton mapUrl={firm.mapUrl} address={firm.address} firmName={firm.name} />
                </div>
              </div>

              {/* Section 2: Phone on standalone line & Call button directly on the line below */}
              {firm.phone ? (
                <div className="bg-[#1A1A1A] p-3 rounded-lg border border-white/5 space-y-2">
                  {/* Line 1: Phone number */}
                  <div className="text-xs text-gray-300 flex items-center gap-2 font-mono">
                    <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Telefon: <strong className="text-white text-sm font-bold">{firm.phone}</strong></span>
                  </div>
                  {/* Line 2: Button 'Zavolat' */}
                  <div className="pt-0.5">
                    <PhoneCallLink phone={firm.phone} variant="button" label="Zavolat" />
                  </div>
                </div>
              ) : (
                <div className="text-xs text-gray-500 italic bg-[#1A1A1A] p-2.5 rounded-lg border border-white/5">
                  Telefonní číslo nezadáno
                </div>
              )}

              {firm.notes && (
                <p className="text-xs text-gray-400 bg-[#1A1A1A] p-2.5 rounded-lg border border-white/5">
                  <strong className="text-gray-300">Poznámka:</strong> {firm.notes}
                </p>
              )}
            </div>

            {/* Badge visual tag preview */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] text-gray-500 font-medium">Barevné rozlišení v jízdách:</span>
              <span
                className="text-xs font-bold px-2.5 py-0.5 rounded-full text-white border"
                style={{
                  backgroundColor: `${firm.color || '#3b82f6'}30`,
                  borderColor: `${firm.color || '#3b82f6'}70`,
                }}
              >
                {firm.name}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Action Button for adding new firm */}
      {!isAdding && (
        <button
          type="button"
          onClick={openAdd}
          id="btn-add-new-firm"
          title="Přidat novou firmu"
          className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40 bg-blue-600 hover:bg-blue-500 text-white font-black p-4 sm:px-5 sm:py-3.5 rounded-full shadow-2xl flex items-center justify-center gap-2 transition-all active:scale-90 cursor-pointer border-2 border-blue-400/40"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
          <span className="hidden sm:inline text-sm font-bold">Přidat firmu</span>
        </button>
      )}

      {/* Delete Confirmation Modal */}
      {deletingFirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Smazat firmu?</h3>
            </div>

            <p className="text-sm text-slate-700">
              Opravdu chcete smazat dodavatelskou firmu{' '}
              <strong className="text-slate-900 font-bold">{deletingFirm.name}</strong>?
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  onDeleteFirm(deletingFirm.id);
                  setDeletingFirm(null);
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm transition-all active:scale-95 shadow-sm cursor-pointer"
              >
                Ano, smazat
              </button>
              <button
                type="button"
                onClick={() => setDeletingFirm(null)}
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

