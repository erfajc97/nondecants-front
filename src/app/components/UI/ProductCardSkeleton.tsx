/**
 * Esqueleto de ProductCard — misma geometría (imagen cuadrada + nombre +
 * precio + chips) para que la carga no haga saltar el layout.
 */
export default function ProductCardSkeleton() {
  return (
    <div className="flex h-full animate-pulse flex-col overflow-hidden rounded-sm border border-border bg-white" aria-hidden="true">
      {/* Imagen */}
      <div className="aspect-square w-full border-b border-border bg-bg-alt" />

      {/* Info */}
      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <div className="h-3.5 w-4/5 rounded-sm bg-bg-alt" />
        <div className="h-3 w-2/5 rounded-sm bg-bg-alt" />
        <div className="mt-2 grid grid-cols-3 gap-1">
          <div className="h-11 rounded-[3px] bg-bg-alt" />
          <div className="h-11 rounded-[3px] bg-bg-alt" />
          <div className="h-11 rounded-[3px] bg-bg-alt" />
        </div>
        <div className="mt-2 h-11 w-full rounded-[3px] bg-bg-alt" />
      </div>
    </div>
  );
}
