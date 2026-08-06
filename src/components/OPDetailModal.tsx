import React, { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  Plus,
  Trash2,
  X,
  FileCheck,
  Package,
  Check,
  Edit2,
  Image as ImageIcon,
  Download,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Paperclip,
} from 'lucide-react';
import { OPRecord, OPItem } from '../types';

interface OPDetailModalProps {
  opNumber: string;
  opRecord?: OPRecord | null;
  onSaveOPRecord: (record: OPRecord) => void;
  onClose: () => void;
}

export const OPDetailModal: React.FC<OPDetailModalProps> = ({
  opNumber,
  opRecord,
  onSaveOPRecord,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'items' | 'document'>('items');

  // Form states initialized from opRecord or defaults
  const [title, setTitle] = useState(opRecord?.title || `Objednávkový list ${opNumber}`);
  const [supplierName, setSupplierName] = useState(opRecord?.supplierName || '');
  const [siteNumber, setSiteNumber] = useState(opRecord?.siteNumber || '');
  const [notes, setNotes] = useState(opRecord?.notes || '');
  const [items, setItems] = useState<OPItem[]>(opRecord?.items || []);
  const [documentDataUrl, setDocumentDataUrl] = useState<string | undefined>(opRecord?.documentDataUrl);
  const [documentFileName, setDocumentFileName] = useState<string | undefined>(opRecord?.documentFileName);
  const [documentFileType, setDocumentFileType] = useState<string | undefined>(opRecord?.documentFileType);

  // New item row input state
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState<string>('');
  const [newItemUnit, setNewItemUnit] = useState('ks');
  const [newItemNote, setNewItemNote] = useState('');

  // Editing existing item state
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editItemName, setEditItemName] = useState('');
  const [editItemQty, setEditItemQty] = useState('');
  const [editItemUnit, setEditItemUnit] = useState('ks');
  const [editItemNote, setEditItemNote] = useState('');

  // Image full view modal
  const [showFullImage, setShowFullImage] = useState(false);

  useEffect(() => {
    if (opRecord) {
      setTitle(opRecord.title || `Objednávkový list ${opNumber}`);
      setSupplierName(opRecord.supplierName || '');
      setSiteNumber(opRecord.siteNumber || '');
      setNotes(opRecord.notes || '');
      setItems(opRecord.items || []);
      setDocumentDataUrl(opRecord.documentDataUrl);
      setDocumentFileName(opRecord.documentFileName);
      setDocumentFileType(opRecord.documentFileType);

      // If there's a document but no items, default to document tab
      if (opRecord.documentDataUrl && (!opRecord.items || opRecord.items.length === 0)) {
        setActiveTab('document');
      }
    }
  }, [opRecord, opNumber]);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: OPItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: newItemName.trim(),
      quantity: newItemQty ? parseFloat(newItemQty) : undefined,
      unit: newItemUnit.trim() || 'ks',
      note: newItemNote.trim() || undefined,
    };

    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    setNewItemName('');
    setNewItemQty('');
    setNewItemNote('');

    saveChanges(updatedItems, documentDataUrl, documentFileName, documentFileType);
  };

  const handleStartEditItem = (item: OPItem) => {
    setEditingItemId(item.id);
    setEditItemName(item.name);
    setEditItemQty(item.quantity !== undefined ? String(item.quantity) : '');
    setEditItemUnit(item.unit || 'ks');
    setEditItemNote(item.note || '');
  };

  const handleSaveEditItem = (id: string) => {
    if (!editItemName.trim()) return;

    const updatedItems = items.map((it) =>
      it.id === id
        ? {
            ...it,
            name: editItemName.trim(),
            quantity: editItemQty ? parseFloat(editItemQty) : undefined,
            unit: editItemUnit.trim() || 'ks',
            note: editItemNote.trim() || undefined,
          }
        : it
    );

    setItems(updatedItems);
    setEditingItemId(null);
    saveChanges(updatedItems, documentDataUrl, documentFileName, documentFileType);
  };

  const handleRemoveItem = (id: string) => {
    const updatedItems = items.filter((it) => it.id !== id);
    setItems(updatedItems);
    saveChanges(updatedItems, documentDataUrl, documentFileName, documentFileType);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 8MB for localStorage base64)
    if (file.size > 8 * 1024 * 1024) {
      alert('Soubor je příliš velký (maximálně 8 MB).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setDocumentDataUrl(dataUrl);
      setDocumentFileName(file.name);
      setDocumentFileType(file.type);
      setActiveTab('document');

      saveChanges(items, dataUrl, file.name, file.type);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveDocument = () => {
    if (confirm('Opravdu chcete odebrat tento nahraný dokument?')) {
      setDocumentDataUrl(undefined);
      setDocumentFileName(undefined);
      setDocumentFileType(undefined);
      setActiveTab('items');
      saveChanges(items, undefined, undefined, undefined);
    }
  };

  const saveChanges = (
    currentItems = items,
    docUrl = documentDataUrl,
    docName = documentFileName,
    docType = documentFileType
  ) => {
    const recordToSave: OPRecord = {
      id: opRecord?.id || `op-${Date.now()}`,
      opNumber: opNumber.trim(),
      title: title.trim(),
      supplierName: supplierName.trim(),
      siteNumber: siteNumber.trim(),
      items: currentItems,
      documentDataUrl: docUrl,
      documentFileName: docName,
      documentFileType: docType,
      notes: notes.trim(),
      createdAt: opRecord?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveOPRecord(recordToSave);
  };

  const isPdf = documentFileType === 'application/pdf' || documentFileName?.toLowerCase().endsWith('.pdf');

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-50 animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-start justify-between gap-3 shrink-0">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 bg-indigo-500 text-white rounded-md font-mono font-extrabold text-sm sm:text-base flex items-center gap-1.5 shadow-xs">
                <FileText className="w-4 h-4 text-indigo-100" />
                {opNumber}
              </span>
              <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded font-medium border border-slate-700">
                Objednávkový list / OP
              </span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => saveChanges()}
              placeholder="Název nebo popis OP..."
              className="text-sm sm:text-base font-bold bg-transparent border-b border-transparent hover:border-slate-700 focus:border-indigo-400 focus:outline-none w-full text-slate-100 transition-all pt-1"
            />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 p-2 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('items')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'items'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Package className="w-4 h-4 text-indigo-600" />
            Vypsané položky ručně
            {items.length > 0 && (
              <span className="bg-indigo-100 text-indigo-800 font-mono text-xs px-2 py-0.5 rounded-full font-bold">
                {items.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('document')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'document'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Paperclip className="w-4 h-4 text-indigo-600" />
            Kopie dodacího listu / Doklad
            {documentDataUrl ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Dodací list přiložen" />
            ) : (
              <span className="text-[10px] text-slate-400 font-normal">(Bez přílohy)</span>
            )}
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: ITEMS */}
          {activeTab === 'items' && (
            <div className="space-y-5">
              {/* Add item form */}
              <form onSubmit={handleAddItem} className="bg-slate-50 border border-slate-300 p-3.5 sm:p-4 rounded-xl space-y-3">
                <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-indigo-700">
                    <Plus className="w-4 h-4" /> Přidat položku do OP
                  </span>
                  <span className="text-[11px] text-slate-500 font-normal">Zadejte materiál nebo položku z objednávky</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  <div className="sm:col-span-6">
                    <input
                      type="text"
                      placeholder="Název položky (např. Sádrokarton RB 12.5mm)"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-indigo-600 font-medium"
                    />
                  </div>
                  <div className="sm:col-span-3 flex gap-1">
                    <input
                      type="number"
                      step="any"
                      placeholder="Množství"
                      value={newItemQty}
                      onChange={(e) => setNewItemQty(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 text-xs sm:text-sm font-mono focus:outline-none focus:border-indigo-600"
                    />
                    <select
                      value={newItemUnit}
                      onChange={(e) => setNewItemUnit(e.target.value)}
                      className="bg-white border border-slate-300 rounded-lg p-2 text-slate-900 text-xs focus:outline-none focus:border-indigo-600 font-bold shrink-0"
                    >
                      <option value="ks">ks</option>
                      <option value="m2">m²</option>
                      <option value="m">m</option>
                      <option value="bm">bm</option>
                      <option value="bal">bal</option>
                      <option value="kg">kg</option>
                      <option value="pal">paleta</option>
                      <option value="sada">sada</option>
                    </select>
                  </div>
                  <div className="sm:col-span-3">
                    <button
                      type="submit"
                      disabled={!newItemName.trim()}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs sm:text-sm transition-all active:scale-95 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Přidat
                    </button>
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Volitelná poznámka k položce (např. Paleta č. 2, pozor na rohy...)"
                    value={newItemNote}
                    onChange={(e) => setNewItemNote(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 text-xs focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </form>

              {/* Items List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-indigo-600" /> Položky objednávky ({items.length})
                  </h4>
                </div>

                {items.length === 0 ? (
                  <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-8 text-center space-y-2">
                    <Package className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-sm font-semibold text-slate-700">Žádné vypsané položky</p>
                    <p className="text-xs text-slate-500">
                      Můžete ručně přidat položky z objednávky výše nebo nahrát naskenovaný dokument v záložce "Nahraný dokument".
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                    {items.map((item, idx) => (
                      <div key={item.id} className="p-3 sm:p-3.5 hover:bg-slate-50/80 transition-all space-y-1">
                        {editingItemId === item.id ? (
                          /* Edit mode */
                          <div className="space-y-2 bg-indigo-50/50 p-2 rounded-lg border border-indigo-200">
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                              <input
                                type="text"
                                value={editItemName}
                                onChange={(e) => setEditItemName(e.target.value)}
                                className="sm:col-span-6 bg-white border border-slate-300 p-2 rounded text-xs font-medium"
                              />
                              <input
                                type="number"
                                step="any"
                                value={editItemQty}
                                onChange={(e) => setEditItemQty(e.target.value)}
                                className="sm:col-span-3 bg-white border border-slate-300 p-2 rounded text-xs font-mono"
                              />
                              <input
                                type="text"
                                value={editItemUnit}
                                onChange={(e) => setEditItemUnit(e.target.value)}
                                className="sm:col-span-3 bg-white border border-slate-300 p-2 rounded text-xs font-bold"
                              />
                            </div>
                            <input
                              type="text"
                              placeholder="Poznámka..."
                              value={editItemNote}
                              onChange={(e) => setEditItemNote(e.target.value)}
                              className="w-full bg-white border border-slate-300 p-2 rounded text-xs"
                            />
                            <div className="flex justify-end gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => handleSaveEditItem(item.id)}
                                className="px-3 py-1 bg-indigo-600 text-white rounded text-xs font-bold"
                              >
                                Uložit
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingItemId(null)}
                                className="px-3 py-1 bg-slate-200 text-slate-700 rounded text-xs font-bold"
                              >
                                Zrušit
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* View mode */
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-2.5 min-w-0">
                              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 font-mono">
                                {idx + 1}
                              </span>
                              <div className="space-y-0.5 min-w-0">
                                <div className="text-xs sm:text-sm font-bold text-slate-900 break-words">
                                  {item.name}
                                </div>
                                {item.note && (
                                  <p className="text-xs text-slate-500 italic break-words">{item.note}</p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              {(item.quantity !== undefined || item.unit) && (
                                <span className="text-xs font-bold font-mono px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg border border-slate-200">
                                  {item.quantity !== undefined ? item.quantity : ''} {item.unit || 'ks'}
                                </span>
                              )}
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleStartEditItem(item)}
                                  className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-slate-100 transition-all cursor-pointer"
                                  title="Upravit položku"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(item.id)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-100 transition-all cursor-pointer"
                                  title="Smazat položku"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: DOCUMENT */}
          {activeTab === 'document' && (
            <div className="space-y-5">
              {documentDataUrl ? (
                /* Document view */
                <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-300">
                  <div className="flex items-center justify-between gap-2 flex-wrap pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-5 h-5 text-emerald-600" />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {documentFileName || 'Přiložený dokument'}
                        </h4>
                        <span className="text-xs text-slate-500">
                          {isPdf ? 'PDF Doklad / Objednávkový list' : 'Obrázek / Fotodokumentace'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={documentDataUrl}
                        download={documentFileName || `${opNumber}_doklad`}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" /> Stáhnout
                      </a>
                      <button
                        type="button"
                        onClick={handleRemoveDocument}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Smazat
                      </button>
                    </div>
                  </div>

                  {/* Attachment Preview */}
                  {isPdf ? (
                    <div className="bg-white p-6 rounded-lg border border-slate-200 text-center space-y-3">
                      <FileText className="w-12 h-12 text-indigo-600 mx-auto" />
                      <p className="text-sm font-bold text-slate-800">{documentFileName}</p>
                      <a
                        href={documentDataUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs transition-all"
                      >
                        <ExternalLink className="w-4 h-4" /> Otevřít PDF v novém okně
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div
                        onClick={() => setShowFullImage(true)}
                        className="relative group cursor-pointer overflow-hidden rounded-lg border border-slate-300 bg-slate-900 max-h-96 flex items-center justify-center"
                      >
                        <img
                          src={documentDataUrl}
                          alt="Sken OP dokladu"
                          className="max-h-96 object-contain w-full group-hover:opacity-90 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-2">
                          <ImageIcon className="w-5 h-5" /> Zobrazit v plné velikosti
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Replace upload box */}
                  <div className="pt-2">
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Nahrát novou verzi dokladu / fotky:
                    </label>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileUpload}
                      className="text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                    />
                  </div>
                </div>
              ) : (
                /* Empty state - Upload dropzone */
                <div className="bg-slate-50 border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-xl p-8 text-center space-y-4 transition-all">
                  <div className="p-4 bg-indigo-50 text-indigo-600 rounded-full w-14 h-14 mx-auto flex items-center justify-center">
                    <Upload className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900">
                      Nahrát kopii dodacího listu nebo dokladu k {opNumber}
                    </h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Vyfoťte dodací list z telefonu nebo přiložte soubor (PDF, fotka DL z prodejny / skladu).
                    </p>
                  </div>

                  <div>
                    <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl cursor-pointer shadow-md active:scale-95 transition-all">
                      <Upload className="w-4 h-4" /> Vybrat soubor nebo vyfotit
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <span className="text-[11px] text-slate-400 block">Podporuje JPG, PNG, WEBP, PDF (max 8MB)</span>
                </div>
              )}
            </div>
          )}

          {/* Additional Notes section */}
          <div className="pt-3 border-t border-slate-200 space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Poznámka k tomuto Objednávkovému listu (OP)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => saveChanges()}
              placeholder="Poznámka k dodávce, zaplacení, výdeji..."
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 border-t border-slate-200 p-4 flex items-center justify-between gap-2 shrink-0">
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Změny se ukládají automaticky.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs sm:text-sm transition-all cursor-pointer shadow-xs"
          >
            HOTOVO / ZAVŘÍT
          </button>
        </div>
      </div>

      {/* Full image viewer modal */}
      {showFullImage && documentDataUrl && !isPdf && (
        <div className="fixed inset-0 bg-slate-950/90 z-60 flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setShowFullImage(false)}
            className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={documentDataUrl}
            alt="OP doklad plná velikost"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
          />
        </div>
      )}
    </div>
  );
};
