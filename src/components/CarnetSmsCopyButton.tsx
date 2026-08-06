import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { copyToClipboard } from '../utils/storage';

interface CarnetSmsCopyButtonProps {
  spz: string;
  siteNumber: string;
  isCopied: boolean;
  onCopied: (text: string) => void;
  carnetText: string;
}

export const CarnetSmsCopyButton: React.FC<CarnetSmsCopyButtonProps> = ({
  isCopied,
  onCopied,
  carnetText,
}) => {
  const [justCopied, setJustCopied] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard(carnetText);
    setJustCopied(true);
    onCopied(carnetText);
    setTimeout(() => setJustCopied(false), 2500);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      id="btn-copy-carnet"
      className={`w-full py-3.5 px-4 rounded-xl font-black text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all shadow-xs active:scale-[0.98] cursor-pointer ${
        justCopied || isCopied
          ? 'bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-600'
          : 'bg-slate-900 hover:bg-slate-800 text-white'
      }`}
    >
      {justCopied || isCopied ? (
        <>
          <Check className="w-5 h-5 stroke-[3] shrink-0" />
          <span>Carnet SMS zkopírován</span>
        </>
      ) : (
        <>
          <Copy className="w-5 h-5 shrink-0" />
          <span>Carnet SMS</span>
        </>
      )}
    </button>
  );
};

