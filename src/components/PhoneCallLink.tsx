import React from 'react';
import { PhoneCall } from 'lucide-react';
import { getCleanTelHref } from '../utils/phone';

interface PhoneCallLinkProps {
  phone?: string;
  label?: string;
  variant?: 'button' | 'inline' | 'badge';
  className?: string;
}

export const PhoneCallLink: React.FC<PhoneCallLinkProps> = ({
  phone,
  label,
  variant = 'badge',
  className = '',
}) => {
  if (!phone || !phone.trim()) return null;

  const telHref = getCleanTelHref(phone);

  if (variant === 'button') {
    return (
      <a
        href={telHref}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-bold transition-all active:scale-95 shadow-sm shrink-0 max-w-full truncate ${className}`}
        title={`Zavolat na číslo: ${phone}`}
      >
        <PhoneCall className="w-3.5 h-3.5 text-white shrink-0" />
        {label && <span className="font-sans font-medium text-emerald-100">{label}:</span>}
        <span className="underline decoration-white/40 underline-offset-2 truncate">{phone}</span>
      </a>
    );
  }

  if (variant === 'inline') {
    return (
      <a
        href={telHref}
        className={`inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-mono text-xs hover:underline active:scale-95 transition-all max-w-full truncate ${className}`}
        title={`Zavolat na číslo: ${phone}`}
      >
        <PhoneCall className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
        {label && <span className="font-sans font-normal text-slate-600">{label}: </span>}
        <span className="font-bold truncate">{phone}</span>
      </a>
    );
  }

  // Default 'badge'
  return (
    <a
      href={telHref}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 font-mono text-xs font-bold transition-all active:scale-95 shrink-0 max-w-full truncate ${className}`}
      title={`Zavolat na číslo: ${phone}`}
    >
      <PhoneCall className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
      {label && <span className="font-sans font-normal text-slate-600">{label}:</span>}
      <span className="underline decoration-emerald-500/40 underline-offset-2 truncate">{phone}</span>
    </a>
  );
};
