import NodSeal from '@/app/components/UI/NodSeal';
import { usePromise } from '@/app/lib/homeContent';

/**
 * Banda negra de promesa de marca (prototipo .promise): sello NöD y tres
 * compromisos numerados en dorado.
 */
export default function PromiseBand() {
  const PROMISES = usePromise();
  return (
    <section aria-label="Nuestra promesa" className="bg-text text-cream">
      <div className="mx-auto grid max-w-[1480px] grid-cols-1 items-center gap-[clamp(20px,3vw,48px)] px-[max(16px,3.4vw)] py-[clamp(36px,4vw,56px)] min-[821px]:grid-cols-3 min-[1181px]:grid-cols-[auto_repeat(3,minmax(0,1fr))]">
        <NodSeal className="justify-self-start max-[820px]:!h-24 max-[820px]:!w-24 min-[821px]:col-span-3 min-[1181px]:col-span-1" />
        {PROMISES.map((p, i) => (
          <div key={p.title}>
            <span className="font-display text-lg text-accent">{String(i + 1).padStart(2, '0')}</span>
            <h3 className="mb-1.5 font-display text-[22px] font-normal text-white">{p.title}</h3>
            <p className="font-body text-sm text-stone-soft">{p.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
