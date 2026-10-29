interface TermsAcceptanceProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function TermsAcceptance({ checked, onChange }: TermsAcceptanceProps) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border-2 border-text-muted transition-colors peer-checked:border-text peer-checked:bg-text peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent-hover">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-bg">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
      <span className="font-body text-[15.5px] leading-snug text-text">
        He leído y acepto los{' '}
        <a
          href="/terminos"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="font-semibold text-text underline underline-offset-2 transition-colors hover:text-accent-hover"
        >
          términos y condiciones
        </a>
      </span>
    </label>
  );
}
