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
  const setDrawerOpen = useCartStore((s) => s.setDrawerOpen);

  const handleAddToCart = () => {
    if (!product || !selectedVariant) {
      sonnerResponse('Selecciona un tamaño primero.', 'error');
      return;
    }
    if (selectedVariant.stock < quantity) {
      sonnerResponse('No hay suficiente stock disponible.', 'error');
      return;
    }
    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      name:      product.name,
      brand:     product.brand,
      image:     product.image,
      ml:        selectedVariant.ml,
      price:     selectedVariant.price,
      quantity,
    });
    sonnerResponse(`${product.name} agregado al carrito.`, 'success');
    setDrawerOpen(true);
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
