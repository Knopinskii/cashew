const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  RUB: "₽",
};

export function getCurrencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency] ?? currency;
}

const AMOUNT = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** One format everywhere: symbol, grouped thousands, always two decimals.
 *
 *  The locale is pinned rather than taken from the browser. toLocaleString()
 *  with no arguments rendered 42.5 as "42,5" on a Russian system while the
 *  amount beside it read "444.00", and money that changes shape by machine is
 *  worse than money in a format someone finds foreign.
 */
export function formatMoney(value: number, currency: string): string {
  const symbol = getCurrencySymbol(currency);
  const sign = value < 0 ? "-" : "";
  return `${sign}${symbol}${AMOUNT.format(Math.abs(value))}`;
}
