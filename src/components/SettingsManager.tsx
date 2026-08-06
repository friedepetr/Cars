import React, { useState, useRef } from 'react';
import { Settings, RotateCcw, ShieldCheck, Download, Upload, Database, RefreshCw } from 'lucide-react';
import { AppSettings } from '../types';
import { INITIAL_SITES, INITIAL_FIRMS, DEFAULT_SETTINGS, DEMO_TRIPS } from '../data/initialData';

interface SettingsManagerProps {
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onResetAllData: (sites: any[], firms: any[], trips: any[], settings: AppSettings) => void;
}

export const SettingsManager: React.FC<SettingsManagerProps> = ({
  settings,
  onResetAllData,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSqliteFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm(`Opravdu chcete nahradit aktuální SQLite databázi aplikací ze souboru "${file.name}"?`)) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploading(true);
    setUploadStatus('Nahrávám a zpracovávám soubor databáze...');
    setUploadError(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const arrayBuffer = reader.result as ArrayBuffer;
          const bytes = new Uint8Array(arrayBuffer);
          let binary = '';
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          const base64 = btoa(binary);

          const res = await fetch('/api/upload-sqlite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ base64 }),
          });

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || 'Nahrání databáze selhalo');
          }

          setUploadStatus('Databáze byla úspěšně nahraná! Obnovuji aplikaci...');
          setTimeout(() => {
            window.location.reload();
          }, 1200);
        } catch (err: any) {
          setUploadError(err.message || 'Chyba při nahrávání databáze');
          setUploading(false);
        }
      };
      reader.onerror = () => {
        setUploadError('Nedařilo se přečíst vybraný soubor');
        setUploading(false);
      };
      reader.readAsArrayBuffer(file);
    } catch (err: any) {
      setUploadError(err.message || 'Chyba při zpracování souboru');
      setUploading(false);
    }
  };

  const handleResetDemo = () => {
    if (confirm('Opravdu chcete obnovit výchozí testovací data (stavby, firmy, ukázková jízda)?')) {
      onResetAllData(INITIAL_SITES, INITIAL_FIRMS, DEMO_TRIPS, DEFAULT_SETTINGS);
      alert('Všechna data byla úspěšně obnovena na výchozí.');
    }
  };

  const handleExportJson = () => {
    const data = {
      sites: localStorage.getItem('van_log_sites_v1'),
      firms: localStorage.getItem('van_log_firms_v1'),
      trips: localStorage.getItem('van_log_trips_v1'),
      settings: localStorage.getItem('van_log_settings_v1'),
      exportedAt: new Date().toISOString(),
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `van_log_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#141414] p-4 sm:p-5 rounded-xl border border-white/10 shadow-lg">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-400" />
          Nastavení a Správa SQLite Databáze
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Kompletní záloha, import/export souboru SQLite databáze.
        </p>
      </div>

      {/* SQLite Database Import & Export */}
      <div className="bg-[#141414] border border-white/10 p-5 rounded-xl space-y-4 shadow-lg">
        <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
          <Database className="w-5 h-5 text-emerald-400" />
          SQLite Databáze (Import / Export .sqlite)
        </h3>

        <p className="text-xs text-gray-300 leading-relaxed">
          Všechna data aplikace (stavby, dodavatelské firmy, výkazy jízd, objednávkové listy OP i nastavení) jsou bezpečně ukládána do souborové databáze <strong className="text-emerald-400 font-mono">SQLite (data/app.sqlite)</strong>. Soubor můžete kdykoliv stáhnout jako zálohu nebo nahrát z počítače.
        </p>

        {uploadStatus && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-lg text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{uploadStatus}</span>
          </div>
        )}

        {uploadError && (
          <div className="p-3 bg-rose-950/60 border border-rose-500/50 rounded-lg text-rose-300 text-xs font-semibold">
            {uploadError}
          </div>
        )}

        <div className="flex flex-wrap gap-3 pt-1">
          {/* Export / Download SQLite */}
          <a
            href="/api/download-sqlite"
            download="app.sqlite"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center gap-2 active:scale-95 transition-all shadow-md cursor-pointer"
          >
            <Download className="w-4 h-4 text-white" /> Stáhnout / Exportovat SQLite databázi (.sqlite)
          </a>

          {/* Import / Upload SQLite */}
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs flex items-center gap-2 active:scale-95 transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            {uploading ? <RefreshCw className="w-4 h-4 animate-spin text-white" /> : <Upload className="w-4 h-4 text-white" />}
            Nahrát / Importovat SQLite databázi (.sqlite / .db)
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".sqlite,.db,.bin"
            onChange={handleSqliteFileChange}
            className="hidden"
          />

          {/* Export JSON */}
          <button
            type="button"
            onClick={handleExportJson}
            className="px-4 py-2.5 bg-[#1A1A1A] hover:bg-white/10 text-gray-200 font-bold rounded-lg text-xs flex items-center gap-2 border border-white/10 active:scale-95 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-blue-400" /> Exportovat zálohu (JSON)
          </button>

          {/* Reset Demo Data */}
          <button
            type="button"
            onClick={handleResetDemo}
            className="px-4 py-2.5 bg-[#1A1A1A] hover:bg-amber-950/40 text-amber-400 font-bold rounded-lg text-xs flex items-center gap-2 border border-white/10 active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" /> Obnovit výchozí vzorová data
          </button>
        </div>
      </div>
    </div>
  );
};
