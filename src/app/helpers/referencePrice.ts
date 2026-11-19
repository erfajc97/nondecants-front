/** Porcentaje de ahorro frente al precio de referencia; null si no hay ahorro real. */
export function referenceSavingPct(reference: number | undefined | null, price: number): number | null {
  if (!reference || !(reference > price) || !(price > 0)) return null;
  return Math.round(((reference - price) / reference) * 100);
}
