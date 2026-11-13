import {
  differenceInHours,
  formatDistanceToNow,
  format,
  isValid,
} from "date-fns";

export function formatSmartDate(
  dateInput: string | Date | undefined | null,
): string {
  if (!dateInput) return "N/A";

  const date = new Date(dateInput);

  if (!isValid(date)) return "Invalid date";

  const hoursAgo = differenceInHours(new Date(), date);

  if (hoursAgo < 1) {
    return formatDistanceToNow(date, { addSuffix: true });
  } else if (hoursAgo < 24) {
    return `${hoursAgo}h ago`;
  } else {
    return format(date, "yyyy/MM/dd");
  }
}

/**
 * Format a date as DD/MM/YYYY — suitable for invoices, quotes, and documents.
 * Returns '—' for null/undefined, 'Invalid date' for unparseable values.
 */
export function formatDocDate(
  dateInput: string | Date | undefined | null,
): string {
  if (!dateInput) return "—";
  const date = new Date(dateInput);
  if (!isValid(date)) return "Invalid date";
  return format(date, "dd/MM/yyyy");
}
