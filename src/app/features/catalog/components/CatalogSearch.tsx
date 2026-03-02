interface CatalogSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function CatalogSearch({ value, onChange }: CatalogSearchProps) {
  return (
    <div className="relative">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[--color-text-muted]"
        width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.5"
      >
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar perfume o marca..."
        className="w-full pl-9 pr-4 py-2.5 bg-[--color-surface] border border-[--color-border] text-[--color-text] placeholder:text-[--color-text-muted] text-sm focus:outline-none focus:border-[--color-accent] transition-colors"
        style={{ borderRadius: 'var(--radius-sm)' }}
      />
    </div>
  );
}
