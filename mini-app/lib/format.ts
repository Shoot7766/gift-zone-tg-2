export function formatPriceUZS(amount: number): string {
  return `${Math.round(amount).toLocaleString("uz-UZ")} so‘m`;
}
