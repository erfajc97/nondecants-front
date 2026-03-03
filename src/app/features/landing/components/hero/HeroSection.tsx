const TRUST_BADGES = [
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <rect x="1" y="3" width="15" height="13" rx="1"/>
        <path d="M16 8h4l3 5v3h-7V8z"/>
        <circle cx="5.5" cy="18.5" r="2.5"/>
        <circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
    label: 'Envíos a todo Ecuador',
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <polyline points="9 12 11 14 15 10"/>
      </svg>
    ),
    label: 'Autenticidad de productos',
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>
      </svg>
    ),
    label: 'Decants originales',
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
    label: 'Compra 100% segura',
  },
]

export default function HeroSection() {
  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden">

      {/* ── Imagen de fondo full-vh ── */}
      <img
        src="/home.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover object-center"
        fetchPriority="high"
      />

      {/* ── Overlay gradiente: Black Carbón izquierda → transparente derecha ── */}
      <div className="absolute inset-0 bg-gradient-to-r from-[--color-bg] via-[--color-bg]/80 to-[--color-bg]/25" />
      {/* Capa extra en móvil para legibilidad */}
      <div className="absolute inset-0 bg-[--color-bg]/50 lg:hidden" />

      {/* ── Contenido principal ── */}
      <div className="relative z-10 flex flex-1 items-start">
        <div className="mx-auto w-full max-w-7xl px-2 pt-32 pb-20 lg:px-4">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">

            {/* ── Columna izquierda ── */}
            <div className="flex flex-col gap-8">
              <div>
                <h1 className="font-heading text-[clamp(1.6rem,3vw,2.8rem)] font-normal uppercase leading-[0.96] tracking-[-0.02em] text-white">
                  Única<br />Experiencia
                </h1>
                <span className="mt-1 block font-body text-[clamp(3.5rem,8vw,7rem)] font-black italic leading-[0.96] tracking-[-0.02em] text-accent">
                  Decants
                </span>
              </div>
            </div>

            {/* ── Columna derecha (solo desktop) ── */}
            <div className="hidden flex-col items-end gap-5 self-start lg:flex">
              <p className="max-w-[22rem] text-right text-xl leading-relaxed text-white">
                Conoce nuestra experiencia en perfumería de lujo. Decants y sellados
                de las mejores marcas, disponibles para envío a todo Ecuador.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* ── Trust badges — anclados al pie del hero ── */}
      <div className="relative z-10 border-t border-[--color-border]/50 bg-[--color-bg]/75 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-5 lg:px-10">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-4">
            {TRUST_BADGES.map((badge) => (
              <div key={badge.label} className="flex items-center gap-3">
                <span className="shrink-0 text-[--color-accent]">{badge.icon}</span>
                <span className="font-heading text-[10px] font-medium uppercase leading-tight tracking-wider text-[--color-text-muted]">
                  {badge.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </section>
  )
}
