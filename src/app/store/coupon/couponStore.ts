import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CouponItemDiscount } from '@/app/helpers/couponItemDiscount';

interface CouponState {
  code: string;
  discount: number;
  freeShipping: boolean;
  applied: boolean;
  message: string;
  /** Descuento por línea (cupones exclusivos / todos). */
  itemDiscounts: CouponItemDiscount[];
  setCode: (code: string) => void;
  apply: (input: { discount: number; freeShipping: boolean; message: string; itemDiscounts?: CouponItemDiscount[] }) => void;
  clear: () => void;
}

export const useCouponStore = create<CouponState>()(
  persist(
    (set) => ({
      code: '',
      discount: 0,
      freeShipping: false,
      applied: false,
      message: '',
      itemDiscounts: [],
      setCode: (code) => set({ code, applied: false, discount: 0, freeShipping: false, message: '', itemDiscounts: [] }),
      apply: ({ discount, freeShipping, message, itemDiscounts }) =>
        set({ applied: true, discount, freeShipping, message, itemDiscounts: itemDiscounts ?? [] }),
      clear: () =>
        set({ code: '', discount: 0, freeShipping: false, applied: false, message: '', itemDiscounts: [] }),
    }),
    {
      name: 'nondecants-coupon',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        code: state.code,
        discount: state.discount,
        freeShipping: state.freeShipping,
        applied: state.applied,
        itemDiscounts: state.itemDiscounts,
      }),
    },
  ),
);
