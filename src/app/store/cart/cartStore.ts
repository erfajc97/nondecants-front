import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface ComboProduct {
  productId?: number;
  productVariationId?: number;
  quantity: number;
}

export interface CartItem {
  productId: string;
  variantId: string;
  name: string;
  image: string;
  ml: number;
  price: number;
  quantity: number;
  comboId?: number;
  comboProducts?: ComboProduct[];
  /** Combo: ml de cada decant (3 / 5 / 10). El mismo combo en 2 tamaños = 2 líneas
   *  (variantId = `combo-{id}-{size}`). Línea: "Combo X · {comboDecants} decants de {size} ml". */
  size?: number;
  /** Combo: cantidad de decants que trae (suma de cantidades de comboProducts). */
  comboDecants?: number;
  bajoPedido?: boolean;
  /** Máximo de unidades que se pueden pedir (stock). undefined = sin límite
   *  (ej. frasco completo bajo pedido). Los decants SIEMPRE traen este tope. */
  maxQty?: number;
  /** Unidades realmente en stock (frasco sellado). Si la cantidad pedida supera
   *  este número, el excedente pasa a "bajo pedido" en el desglose del carrito.
   *  undefined = no aplica split (decant topado, o producto 100% bajo pedido). */
  stockAvailable?: number;
  /** ml físicos disponibles del producto (frasco abierto + frascos sellados).
   *  Frascos y decants del mismo producto comparten este pool: los frascos que
   *  se venden lo consumen y los decants sobrantes pasan a bajo pedido. */
  availableMl?: number;
}

const clampQty = (qty: number, max?: number) =>
  max != null ? Math.max(1, Math.min(qty, max)) : Math.max(1, qty);

interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;
  _hasHydrated?: boolean;

  // Computed
  total: () => number;
  itemCount: () => number;

  // Actions
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQty: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  setDrawerOpen: (open: boolean) => void;
  setHasHydrated: (hydrated: boolean) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,
      _hasHydrated: false,

      total: () =>
        get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),

      itemCount: () =>
        get().items.reduce((acc, item) => acc + item.quantity, 0),

      addItem: (newItem) => {
        set((state) => {
          const existing = state.items.find((i) => i.variantId === newItem.variantId);
          if (existing) {
            const max = newItem.maxQty ?? existing.maxQty;
            return {
              items: state.items.map((i) =>
                i.variantId === newItem.variantId
                  ? { ...i, maxQty: max, quantity: clampQty(i.quantity + newItem.quantity, max) }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...newItem, quantity: clampQty(newItem.quantity, newItem.maxQty) }] };
        });
      },

      removeItem: (variantId) => {
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        }));
      },

      updateQty: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.variantId === variantId ? { ...i, quantity: clampQty(quantity, i.maxQty) } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      setDrawerOpen: (open) => set({ isDrawerOpen: open }),

      setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),
    }),
    {
      name: 'nondecants-cart',
      storage: typeof window !== 'undefined' ? createJSONStorage(() => localStorage) : undefined,
      // Solo persistir items (no el estado del drawer)
      partialize: (state) => ({ items: state.items }),
      // Marcar como hidratado cuando se rehydrate desde localStorage
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);
