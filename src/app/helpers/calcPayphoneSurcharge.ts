// Recargo del 6% para pagos con tarjeta Payphone
const PAYPHONE_SURCHARGE_RATE = 0.06;

export const calcPayphoneSurcharge = (subtotal: number): number => {
  return parseFloat((subtotal * PAYPHONE_SURCHARGE_RATE).toFixed(2));
};

export const calcTotalWithSurcharge = (subtotal: number): number => {
  return parseFloat((subtotal * (1 + PAYPHONE_SURCHARGE_RATE)).toFixed(2));
};
