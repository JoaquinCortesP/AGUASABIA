export const numberFormatter = new Intl.NumberFormat("es-CL", {
  maximumFractionDigits: 1,
});

export const compactNumberFormatter = new Intl.NumberFormat("es-CL", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatHectares(value: number) {
  return `${numberFormatter.format(value)} ha`;
}

export function formatPercentage(value: number) {
  return `${numberFormatter.format(value)}%`;
}

export function formatMm(value: number) {
  return `${numberFormatter.format(value)} mm`;
}
