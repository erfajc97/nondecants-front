import type { Product } from '@/app/types/global.types';

/** Qué bloques editoriales tienen datos reales (se omite el resto). */
export function getEditorialFlags(product: Product) {
  const hasScent = (product.scentSections ?? []).length > 0;
  const hasIdentity =
    (product.mood ?? []).length > 0 ||
    (product.occasion ?? []).length > 0 ||
    product.longevity != null ||
    product.projectionScore != null;
  const hasSignature = !!(
    product.signatureTitle ||
    product.signatureDescription ||
    product.signatureImageUrl
  );
  const hasDetail = !!(product.detailDescription || (product.benefits ?? []).length > 0);
  return { hasScent, hasIdentity, hasNotes: hasScent || hasIdentity, hasSignature, hasDetail };
}
