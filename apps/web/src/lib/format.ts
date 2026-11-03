/**
 * Unified Currency & Date Formatting Helpers for OmniPOS
 */

/**
 * Safely format any numeric or decimal string value into Vietnamese Dong (VND)
 * e.g. 2400000 -> "2.400.000₫"
 */
export function formatVND(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '0₫';
  const num = typeof value === 'number' ? value : Number(value);
  if (isNaN(num)) return '0₫';
  return `${Math.round(num).toLocaleString('vi-VN')}₫`;
}

/**
 * Format a number into localized string with separators
 */
export function formatNumber(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '0';
  const num = typeof value === 'number' ? value : Number(value);
  if (isNaN(num)) return '0';
  return num.toLocaleString('vi-VN');
}

/**
 * Format date string into Vietnamese locale format dd/mm/yyyy hh:mm
 */
export function formatDateTime(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return '';
  const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (isNaN(d.getTime())) return String(dateStr);
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format date string into Vietnamese locale format dd/mm/yyyy
 */
export function formatDate(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return '';
  const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (isNaN(d.getTime())) return String(dateStr);
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
