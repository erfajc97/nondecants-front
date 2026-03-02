const TRUST_BADGES = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    label: 'Compra Segura',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ),
    label: 'Autenticidad Garantizada',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
      </svg>
    ),
    label: 'Alta Calidad',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-5.07"/>
      </svg>
    ),
    label: 'Devoluciones',
  },
];

export default function HeroSection() {
  return (
    <section className="relative bg-[--color-bg] overflow-hidden">
      {/* Fondo gradiente radial */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 70% 40%, rgba(204,179,119,0.12) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[520px] items-center gap-8 py-16 lg:py-20">

          {/* Columna izquierda — texto */}
          <div className="flex flex-col items-start gap-6 z-10">
            <p className="font-heading text-xs tracking-[0.35em] text-[--color-accent] uppercase">
              NönDecants — Ecuador
            </p>

            <div>
              <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl text-[--color-text] leading-[0.95] uppercase">
                Única<br />Experiencia
              </h1>
              <span
                className="block font-heading text-5xl md:text-6xl lg:text-7xl uppercase mt-1"
                style={{
                  WebkitTextStroke: '2px var(--color-accent)',
                  color: 'transparent',
                  lineHeight: '0.95',
                }}
              >
                Decants
              </span>
            </div>

            <p className="text-[--color-text-muted] text-sm leading-relaxed max-w-sm">
              Fragancias originales, selladas y en decant, de las mejores marcas del mundo.
              Envíos a todo Ecuador vía Servientrega.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <a
                href="/catalogo"
                className="px-8 py-3.5 bg-[--color-accent] text-[--color-bg] font-heading text-sm uppercase tracking-widest text-center hover:bg-[--color-accent-hover] transition-colors"
                style={{ borderRadius: 'var(--radius-sm)' }}
              >
                Explorar colección
              </a>
              <a
                href="/catalogo?type=DECANT"
                className="px-8 py-3.5 border border-[--color-border-accent] text-[--color-accent] font-heading text-sm uppercase tracking-widest text-center hover:bg-[--color-surface] transition-colors"
                style={{ borderRadius: 'var(--radius-sm)' }}
              >
                Ver decants
              </a>
            </div>
          </div>

          {/* Columna derecha — imágenes collage */}
          <div className="relative hidden lg:flex items-end justify-center h-[480px]">
            {/* Imagen principal */}
            <div
              className="absolute right-0 bottom-0 w-52 h-72 overflow-hidden shadow-2xl"
              style={{ borderRadius: 'var(--radius-md)' }}
            >
              <img
                src="https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=300&h=400&fit=crop&q=85"
                alt="Fragancia"
                className="w-full h-full object-cover"
              />
            </div>
            <div
              className="absolute right-40 bottom-12 w-40 h-56 overflow-hidden shadow-xl"
              style={{ borderRadius: 'var(--radius-md)' }}
            >
              <img
                src="https://images.unsplash.com/photo-1541643600914-78b084683702?w=240&h=320&fit=crop&q=85"
                alt="Fragancia"
                className="w-full h-full object-cover"
              />
            </div>
            <div
              className="absolute right-80 bottom-20 w-32 h-48 overflow-hidden shadow-lg"
              style={{ borderRadius: 'var(--radius-md)', opacity: 0.85 }}
            >
              <img
                src="https://images.unsplash.com/photo-1594035910387-fea47794261f?w=200&h=280&fit=crop&q=85"
                alt="Fragancia"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Glow effect */}
            <div
              className="absolute bottom-0 right-0 w-64 h-64 rounded-full pointer-events-none blur-3xl"
              style={{ background: 'rgba(204,179,119,0.15)' }}
            />
          </div>
        </div>

        {/* Trust badges */}
        <div className="border-t border-[--color-border] py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {TRUST_BADGES.map((badge) => (
              <div key={badge.label} className="flex flex-col items-center gap-2 text-center">
                <span className="text-[--color-accent]">{badge.icon}</span>
                <span className="font-heading text-xs uppercase tracking-wider text-[--color-text-muted]">
                  {badge.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
