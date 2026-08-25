const formatters = new Map<number, Intl.NumberFormat>();

export function fmt(value: number, digits = 0): string {
  let formatter = formatters.get(digits);
  if (!formatter) {
    formatter = new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
    formatters.set(digits, formatter);
  }
  return formatter.format(value);
}

export const fmtWh = (value: number) => `${fmt(value)} Wh`;
export const fmtKwh = (wh: number) => `${fmt(wh / 1000, 2)} kWh`;
export const fmtTnd = (value: number, digits = 3) => `${fmt(value, digits)} TND`;
export const fmtPercent = (ratio: number) => `${fmt(ratio * 100)} %`;
export const fmtHour = (hour: number) => `${hour} h`;

export function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
