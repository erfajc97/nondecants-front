import AppProviders from '@/app/providers/AppProviders';
import { useActiveCombosQuery } from '@/app/tanstack-queries/combosQuery';
import ComboGrid from './components/ComboGrid';

function CombosContent() {
  const { data: combos = [], isLoading } = useActiveCombosQuery();

  return (
    <div className="mx-auto max-w-[1480px] px-4 pb-12 md:px-[clamp(16px,3.4vw,52px)] md:pb-20">
      {/* Encabezado de página */}
      <header className="pb-4 pt-7 md:pb-5 md:pt-12">
        <span className="inline-flex items-center gap-1.5 font-body text-[13px] font-semibold text-accent-hover">
          <span aria-hidden="true" className="text-accent">✦</span>
          Selecciones de la casa
        </span>
        <h2 className="mt-2 font-display text-[clamp(46px,6vw,84px)] leading-[0.95] tracking-[-0.025em] text-text">
          Combos
        </h2>
        <p className="mt-2.5 max-w-[46ch] font-body text-text-muted">
          Cada combo, pensado para un momento. Decants originales con ahorro frente a comprarlos por separado.
        </p>
      </header>

      <ComboGrid combos={combos} isLoading={isLoading} />
    </div>
  );
}

export default function CombosSection() {
  return (
    <AppProviders>
      <CombosContent />
    </AppProviders>
  );
}
