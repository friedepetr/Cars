import React from 'react';
import { MapPin, ExternalLink } from 'lucide-react';

interface MapLinkButtonProps {
  mapUrl?: string;
  address?: string;
  firmName?: string;
  variant?: 'button' | 'badge' | 'full';
  label?: string;
  className?: string;
}

export const MapLinkButton: React.FC<MapLinkButtonProps> = ({
  mapUrl,
  address,
  firmName,
  variant = 'button',
  label = 'Zobrazit na mapě',
  className = '',
}) => {
  const getMapHref = (): string => {
    if (mapUrl && mapUrl.trim()) {
      let url = mapUrl.trim();
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`;
      }
      return url;
    }
    if (address && address.trim()) {
      return `https://mapy.cz/zakladni?q=${encodeURIComponent(address.trim())}`;
    }
    if (firmName && firmName.trim()) {
      return `https://mapy.cz/zakladni?q=${encodeURIComponent(firmName.trim())}`;
    }
    return 'https://mapy.cz';
  };

  const href = getMapHref();

  if (variant === 'badge') {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition-all cursor-pointer ${className}`}
        title="Otevřít místo na Mapy.cz"
      >
        <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
        <span>{label}</span>
        <ExternalLink className="w-2.5 h-2.5 text-emerald-400 opacity-70 shrink-0" />
      </a>
    );
  }

  if (variant === 'full') {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs active:scale-[0.98] transition-all cursor-pointer ${className}`}
      >
        <MapPin className="w-4 h-4 shrink-0" />
        <span>{label}</span>
        <ExternalLink className="w-3 h-3 opacity-80 shrink-0" />
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer ${className}`}
      title="Otevřít na Mapy.cz"
    >
      <MapPin className="w-3.5 h-3.5 shrink-0" />
      <span>{label}</span>
      <ExternalLink className="w-3 h-3 opacity-80 shrink-0" />
    </a>
  );
};
