/**
 * Extract a clean number string suitable for href="tel:..."
 */
export const getCleanTelHref = (phoneStr?: string): string => {
  if (!phoneStr) return '';
  // Try matching numbers with optional leading +
  const clean = phoneStr.replace(/[^0-9+]/g, '');
  return clean ? `tel:${clean}` : `tel:${phoneStr}`;
};
