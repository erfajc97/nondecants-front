import { useState } from 'react';

interface ProductImagesProps {
  images: string[];
  name: string;
}

export default function ProductImages({ images, name }: ProductImagesProps) {
  const [active, setActive] = useState(0);
  const list = images.length > 0 ? images : [];

  if (list.length === 0) {
    return (
      <div className="aspect-square bg-[--color-surface] flex items-center justify-center text-[--color-text-muted]" style={{ borderRadius: 'var(--radius-md)' }}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.75">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      {/* Thumbnails — vertical strip on the left */}
      {list.length > 1 && (
        <div className="flex flex-col gap-2 shrink-0">
          {list.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`w-14 h-18 shrink-0 overflow-hidden border transition-colors ${
                active === i ? 'border-[--color-accent]' : 'border-[--color-border] opacity-60 hover:opacity-100'
              }`}
              style={{ borderRadius: 'var(--radius-sm)', height: '72px' }}
            >
              <img src={img} alt={`${name} ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Main image — portrait */}
      <div
        className="flex-1 aspect-[3/4] overflow-hidden bg-[--color-surface]"
        style={{ borderRadius: 'var(--radius-sm)' }}
      >
        <img
          src={list[active]}
          alt={name}
          className="w-full h-full object-cover transition-opacity duration-300"
        />
      </div>
    </div>
  );
}
