import ComboCard from './ComboCard';
import Loader from '@/app/components/Loader';
import type { Combo } from '@/app/types/global.types';

interface ComboGridProps {
  combos: Combo[];
  isLoading: boolean;
}

export default function ComboGrid({ combos: all, isLoading }: ComboGridProps) {
  // Las versiones (3/5/10 ml) viven dentro de su combo base: no van como tarjetas aparte.
  const combos = all.filter((c) => !c.parentComboId);
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 md:py-32">
        <Loader size={45} />
      </div>
    );
  }

  if (combos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center md:py-20">
        <p className="font-body text-[15px] text-text-muted">
          No hay combos disponibles en este momento.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-3 lg:gap-[18px] xl:grid-cols-4">
      {combos.map((combo) => (
        <ComboCard key={combo.id} combo={combo} />
      ))}
    </div>
  );
}
