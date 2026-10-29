interface CheckoutStepTabsProps {
  step: 1 | 2;
  setStep: (step: 1 | 2) => void;
}

const STEPS: { n: 1 | 2; label: string }[] = [
  { n: 1, label: 'Envío' },
  { n: 2, label: 'Pago' },
];

export default function CheckoutStepTabs({ step, setStep }: CheckoutStepTabsProps) {
  return (
    <div className="flex items-center gap-3 border-b border-border pb-5">
      {STEPS.map((s, i) => {
        const active = step === s.n;
        const done = step > s.n;
        return (
          <div key={s.n} className="flex flex-1 items-center gap-3 last:flex-none">
            <button
              type="button"
              onClick={() => setStep(s.n)}
              aria-current={active ? 'step' : undefined}
              className="flex items-center gap-3 text-left"
            >
              <span
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-full font-body text-[17px] font-bold text-bg ${
                  done ? 'bg-success' : active ? 'bg-text' : 'bg-text-muted'
                }`}
              >
                {done ? '✓' : s.n}
              </span>
              <span className={`font-body text-[17px] font-bold ${active ? 'text-text' : 'text-text-muted'}`}>
                {s.label}
              </span>
            </button>
            {i < STEPS.length - 1 && <span className="h-px flex-1 bg-border" aria-hidden="true" />}
          </div>
        );
      })}
    </div>
  );
}
