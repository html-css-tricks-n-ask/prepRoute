/**
 * Shared formatting utilities used across components and tables.
 */

/**
 * Format an ISO date string into a readable short date.
 * @param {string} iso - ISO 8601 date string
 * @returns {string} e.g. "03 Jul 2026"
 */
export function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format a duration in minutes into a display string.
 * @param {number} mins
 * @returns {string} e.g. "90 mins"
 */
export function formatDuration(mins) {
  if (mins == null) return '—';
  return `${mins} mins`;
}

/**
 * Capitalize the first letter of a status string.
 * @param {string} status
 * @returns {string} e.g. "draft" → "Draft"
 */
export function formatStatus(status) {
  if (!status) return '—';
  return status.charAt(0).toUpperCase() + status.slice(1);
}

/**
 * Format a marks value with a leading +/- sign.
 * @param {number} value
 * @returns {string} e.g. 5 → "+5", -1 → "-1"
 */
export function formatMarks(value) {
  if (value == null) return '—';
  return value >= 0 ? `+${value}` : `${value}`;
}
