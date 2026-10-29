interface FilterPillGroupProps {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  singleSelect?: boolean;
}

export default function FilterPillGroup({
  label,
  options,
  selected,
  onChange,
  singleSelect = false,
}: FilterPillGroupProps) {
  const handleToggle = (value: string) => {
    if (singleSelect) {
      onChange(selected.includes(value) ? [] : [value]);
    } else {
      onChange(
        selected.includes(value)
          ? selected.filter((v) => v !== value)
          : [...selected, value],
      );
    }
  };

  return (
    <div className="border-b border-border py-4">
      <p className="mb-3 font-body text-[12.5px] font-bold uppercase tracking-[0.08em] text-text-muted">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isActive = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleToggle(opt.value)}
              aria-pressed={isActive}
              className={`inline-flex h-10 items-center rounded-full border px-3.5 font-body text-[14.5px] transition-[background-color,border-color,color,transform] duration-200 active:scale-[0.97] ${
                isActive
                  ? 'border-text bg-text text-white'
                  : 'border-border bg-white text-text hover:border-text'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
