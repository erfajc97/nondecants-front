import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface CouponState {
  code: string;
  discount: number;
  freeShipping: boolean;
  applied: boolean;
  message: string;
  setCode: (code: string) => void;
  apply: (input: { discount: number; freeShipping: boolean; message: string }) => void;
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
      setCode: (code) => set({ code, applied: false, discount: 0, freeShipping: false, message: '' }),
      apply: ({ discount, freeShipping, message }) =>
        set({ applied: true, discount, freeShipping, message }),
      clear: () =>
        set({ code: '', discount: 0, freeShipping: false, applied: false, message: '' }),
    }),
    {
      name: 'nondecants-coupon',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        code: state.code,
        discount: state.discount,
        freeShipping: state.freeShipping,
        applied: state.applied,
      }),
    },
  ),
);
