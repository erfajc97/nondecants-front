/** Clases compartidas del checkout (look del rebranding: campos grandes, bordes de 2px). */
export const INPUT_CLASS =
  'h-14 w-full rounded-md border-2 border-border bg-surface px-3.5 font-body text-[17px] text-text placeholder:text-text-muted transition-colors focus:border-text focus:outline-none';

export const SELECT_CLASS =
  'h-14 w-full rounded-md border-2 border-border bg-surface px-3.5 font-body text-[17px] text-text outline-none transition-colors placeholder:text-text-muted focus:border-text';

export const CARD_CLASS = 'rounded-md border border-border bg-surface';

export const BTN_PRIMARY =
  'flex min-h-14 w-full items-center justify-center gap-2 rounded-sm bg-text px-6 py-3 font-body text-[17px] font-semibold text-bg transition-colors hover:bg-text-soft disabled:cursor-not-allowed disabled:bg-border disabled:text-text-muted';

/** Opción tipo radio grande (entrega / pago / dirección guardada). */
export const optionClass = (active: boolean) =>
  `flex w-full items-start gap-3.5 rounded-md border-2 p-4 text-left transition-colors ${
    active ? 'border-text bg-gold-light' : 'border-border hover:border-text-muted'
  }`;

export const radioDotClass = (active: boolean) =>
  `mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
    active ? 'border-text' : 'border-text-muted'
  }`;
