import React from 'react';
import { FileText, ChevronDown, Paperclip, Package, Sparkles } from 'lucide-react';
import { OPRecord } from '../types';

interface OPBadgeProps {
  opNumber: string;
  opRecord?: OPRecord | null;
  onOpenOP: (opNumber: string) => void;
  className?: string;
}

export const OPBadge: React.FC<OPBadgeProps> = ({
  opNumber,
  opRecord,
  onOpenOP,
  className = '',
}) => {
  const itemCount = opRecord?.items?.length || 0;
  const hasDoc = !!opRecord?.documentDataUrl;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onOpenOP(opNumber);
      }}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100/90 border border-indigo-200/90 hover:border-indigo-300 text-indigo-800 font-mono font-bold text-xs transition-all shadow-xs active:scale-95 cursor-pointer group select-none ${className}`}
      title={`Klikněte pro zobrazení detailu OP (${opNumber}) — položky / dokument`}
    >
      <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0 group-hover:scale-110 transition-transform" />
      <span className="underline decoration-indigo-300 underline-offset-2">{opNumber}</span>

      {hasDoc && (
        <span
          className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse"
          title="Dokument / sken je nahraný"
        />
      )}

      {itemCount > 0 && (
        <span className="text-[10px] bg-indigo-200/80 text-indigo-900 px-1.5 py-0.2 rounded font-sans font-bold shrink-0">
          {itemCount} {itemCount === 1 ? 'položka' : itemCount < 5 ? 'položky' : 'položek'}
        </span>
      )}

      <ChevronDown className="w-3.5 h-3.5 text-indigo-500 shrink-0 group-hover:translate-y-0.5 transition-transform" />
    </button>
  );
};

// Utility function to detect OP numbers in text
export const extractOPNumbers = (text: string): string[] => {
  if (!text) return [];
  // Matches OP-2026/045, OP 2026-08, OP-104, OP:441, OP#99, etc.
  const opRegex = /\b(OP[-/#:\s]?\d+[\w/-]*)\b/gi;
  const matches = text.match(opRegex) || [];
  // Return unique cleaned up OP numbers
  const unique = Array.from(new Set(matches.map((m) => m.trim())));
  return unique;
};

// Helper component that renders text with embedded OP badges
export const RenderTextWithOPBadges: React.FC<{
  text: string;
  opRecords?: OPRecord[];
  onOpenOP: (opNumber: string) => void;
  className?: string;
}> = ({ text, opRecords = [], onOpenOP, className = '' }) => {
  if (!text) return null;

  const opRegex = /\b(OP[-/#:\s]?\d+[\w/-]*)\b/gi;
  const parts = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = opRegex.exec(text)) !== null) {
    const opNumber = match[0].trim();
    const startIndex = match.index;

    if (startIndex > lastIndex) {
      parts.push(text.substring(lastIndex, startIndex));
    }

    const matchedRecord = opRecords.find(
      (r) => r.opNumber.toLowerCase() === opNumber.toLowerCase()
    );

    parts.push(
      <OPBadge
        key={`op-${startIndex}-${opNumber}`}
        opNumber={opNumber}
        opRecord={matchedRecord}
        onOpenOP={onOpenOP}
      />
    );

    lastIndex = opRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return <span className={className}>{parts}</span>;
};
