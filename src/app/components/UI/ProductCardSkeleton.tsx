/**
 * Esqueleto de ProductCard — misma geometría (imagen cuadrada + nombre +
 * precio + chips) para que la carga no haga saltar el layout.
 */
export default function ProductCardSkeleton() {
  return (
    <div className="flex h-full animate-pulse flex-col bg-white" aria-hidden="true">
      {/* Imagen */}
      <div className="aspect-square w-full bg-bg-alt" />

      {/* Info */}
      <div className="flex flex-1 flex-col gap-2 px-3 pb-3 pt-3">
        <div className="h-3.5 w-4/5 rounded-sm bg-bg-alt" />
        <div className="h-3 w-2/5 rounded-sm bg-bg-alt" />
        <div className="mt-1 flex gap-1.5">
          <div className="h-6 w-12 rounded-sm bg-bg-alt" />
          <div className="h-6 w-12 rounded-sm bg-bg-alt" />
        </div>
        <div className="mt-2 h-8 w-full bg-bg-alt md:hidden" />
      </div>
    </div>
  );
}
