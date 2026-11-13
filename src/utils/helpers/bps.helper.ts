/**
 * Utility functions for converting between Percentage (%) and Basis Points (bps).
 * Standard: 1% = 100 bps, 10% = 1000 bps, 100% = 10000 bps.
 */

/**
 * Converts percentage (%) to basis points (bps).
 * @example
 * percentToBps(10) => 1000
 * percentToBps(8.5) => 850
 * percentToBps(0) => 0
 */
export function percentToBps(percent: number | string | null | undefined): number {
  if (percent === null || percent === undefined || percent === '') return 0;
  const num = typeof percent === 'string' ? parseFloat(percent) : percent;
  if (isNaN(num)) return 0;
  return Math.round(num * 100);
}

/**
 * Converts basis points (bps) to percentage (%).
 * @example
 * bpsToPercent(1000) => 10
 * bpsToPercent(850) => 8.5
 * bpsToPercent(0) => 0
 */
export function bpsToPercent(bps: number | string | null | undefined): number {
  if (bps === null || bps === undefined || bps === '') return 0;
  const num = typeof bps === 'string' ? parseFloat(bps) : bps;
  if (isNaN(num)) return 0;
  return num / 100;
}

/**
 * Formats basis points (bps) into a readable percentage string.
 * @example
 * formatBpsAsPercent(1000) => "10%"
 * formatBpsAsPercent(850) => "8.5%"
 * formatBpsAsPercent(1000, false) => "10"
 */
export function formatBpsAsPercent(
  bps: number | string | null | undefined,
  includeSymbol = true
): string {
  const pct = bpsToPercent(bps);
  // Format up to 2 decimal places, removing unnecessary trailing zeros (e.g. 10 instead of 10.00)
  const formatted = parseFloat(pct.toFixed(2)).toString();
  return includeSymbol ? `${formatted}%` : formatted;
}

/**
 * Formats a description text showing both percentage and bps representation.
 * @example
 * formatBpsDescription(1000, 'VAT') => "1000 bps = 10% VAT"
 * formatBpsDescription(10, 'VAT', true) => "10% VAT = 1000 bps" (when inputting percentage)
 */
export function formatBpsDescription(
  val: number | string | null | undefined,
  label = 'VAT',
  inputIsPercent = true
): string {
  if (inputIsPercent) {
    const pct = typeof val === 'string' ? parseFloat(val) || 0 : (val ?? 0);
    const bps = percentToBps(pct);
    return `${pct}% ${label} = ${bps} bps`;
  } else {
    const bps = typeof val === 'string' ? parseFloat(val) || 0 : (val ?? 0);
    const pct = bpsToPercent(bps);
    return `${bps} bps = ${parseFloat(pct.toFixed(2))}% ${label}`;
  }
}
