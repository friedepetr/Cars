import React from 'react';
import { CornerDownLeft, Sparkles, FileText, Plus, Paperclip } from 'lucide-react';
import { OPRecord } from '../types';
import { RenderTextWithOPBadges, extractOPNumbers, OPBadge } from './OPBadge';

interface TripContentInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  opRecords?: OPRecord[];
  onOpenOP?: (opNumber: string) => void;
}

export const TripContentInput: React.FC<TripContentInputProps> = ({
  value,
  onChange,
  placeholder = 'Napište účel jízdy nebo čísla OP (např. OP-2026/045; závoz materiálu; OP-2026/046)...',
  opRecords = [],
  onOpenOP,
}) => {
  // Split items by semicolon to render preview lines if user entered multiple items
  const items = value
    .split(';')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  // Extract all OP numbers present in the input text in real time
  const detectedOPs = extractOPNumbers(value);

  return (
    <div className="space-y-2.5 max-w-full">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <label htmlFor="trip-content-textarea" className="block text-xs sm:text-sm font-bold text-slate-800">
          Obsah, úkoly a čísla OP jízdy
        </label>
        <span className="text-[11px] text-slate-500 font-medium italic">
          💡 Zadejte čísla OP a oddělujte středníkem ( ; )
        </span>
      </div>

      <textarea
        id="trip-content-textarea"
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-sans text-sm shadow-2xs"
      />

      {/* Live detected OP badges container */}
      {detectedOPs.length > 0 && onOpenOP && (
        <div className="bg-indigo-50/90 border border-indigo-200 rounded-xl p-3 space-y-2">
          <div className="text-xs font-bold text-indigo-900 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Paperclip className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>Detekovaná čísla OP (kliknutím přiložíte kopii dodacího listu):</span>
            </span>
          </div>
          <div className="flex flex-wrap gap-2 pt-0.5">
            {detectedOPs.map((opNum) => {
              const matchedRecord = opRecords.find(
                (r) => r.opNumber.toLowerCase() === opNum.toLowerCase()
              );
              return (
                <OPBadge
                  key={opNum}
                  opNumber={opNum}
                  opRecord={matchedRecord}
                  onOpenOP={onOpenOP}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Semicolon-separated item preview list */}
      {items.length > 1 && (
        <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 space-y-1.5">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
            Rozdělený obsah jízdy ({items.length} položek):
          </div>
          <ul className="space-y-1.5 text-xs sm:text-sm text-slate-800">
            {items.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-white p-2 rounded-lg border border-slate-200">
                <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 font-mono">
                  {idx + 1}
                </span>
                <span className="break-words font-medium text-slate-900 min-w-0">
                  {onOpenOP ? (
                    <RenderTextWithOPBadges text={item} opRecords={opRecords} onOpenOP={onOpenOP} />
                  ) : (
                    item
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export const RenderTripContent: React.FC<{
  content: string;
  opRecords?: OPRecord[];
  onOpenOP?: (opNumber: string) => void;
}> = ({ content, opRecords = [], onOpenOP }) => {
  if (!content || !content.trim()) {
    return <span className="text-slate-400 italic text-xs sm:text-sm">Bez popisu</span>;
  }

  const items = content
    .split(';')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  if (items.length <= 1) {
    return (
      <div className="text-xs sm:text-sm text-slate-800 break-words leading-relaxed">
        {onOpenOP ? (
          <RenderTextWithOPBadges text={content} opRecords={opRecords} onOpenOP={onOpenOP} />
        ) : (
          content
        )}
      </div>
    );
  }

  return (
    <ul className="space-y-1.5 mt-1">
      {items.map((item, idx) => (
        <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-800">
          <span className="text-blue-600 font-mono text-xs select-none shrink-0">•</span>
          <span className="break-words font-medium text-slate-900 min-w-0">
            {onOpenOP ? (
              <RenderTextWithOPBadges text={item} opRecords={opRecords} onOpenOP={onOpenOP} />
            ) : (
              item
            )}
          </span>
        </li>
      ))}
    </ul>
  );
};

