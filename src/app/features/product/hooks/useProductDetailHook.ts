import { useState } from 'react';
import { useProductByIdQuery } from '@/app/tanstack-queries/productsQuery';
import { useCartStore } from '@/app/store/cart/cartStore';
import { sonnerResponse } from '@/app/helpers/sonnerResponse';
import type { ProductVariant } from '@/app/types/global.types';

export function useProductDetailHook(productId: string) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading } = useProductByIdQuery(productId);
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = () => {
    if (!product || !selectedVariant) {
      sonnerResponse('Selecciona un tamaño primero.', 'error');
      return;
    }
    if (selectedVariant.availableQuantity < quantity) {
      sonnerResponse('No hay suficiente stock disponible.', 'error');
      return;
    }
    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      name:      product.name,
      image:     selectedVariant.images?.[0] || product.image || '',
      ml:        selectedVariant.ml,
      price:     selectedVariant.price,
      quantity,
    });
    useCartStore.getState().setDrawerOpen(true);
  };

  return {
    product,
    isLoading,
    selectedVariant,
    setSelectedVariant,
    quantity,
    setQuantity,
    handleAddToCart,
  };
}
