interface FilterPriceRangeProps {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
}

export default function FilterPriceRange({
  label,
  min,
  max,
  value,
  onChange,
}: FilterPriceRangeProps) {
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  return (
    <div className="py-4">
      <p className="mb-3 font-body text-[12.5px] font-bold uppercase tracking-[0.08em] text-text-muted">{label}</p>
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="font-body text-sm text-text-muted">${min}</span>
        <span className="font-body text-base font-semibold text-text">${value}</span>
        <span className="font-body text-sm text-text-muted">${max}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={handleSliderChange}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border accent-accent"
      />
    </div>
  );
}
