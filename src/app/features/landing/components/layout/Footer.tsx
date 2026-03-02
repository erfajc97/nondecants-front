const LINKS_COL1 = [
  { href: '/catalogo',              label: 'Perfumes' },
  { href: '/catalogo?type=SELLADO', label: 'Sellados' },
  { href: '/catalogo?type=DECANT',  label: 'Decants' },
  { href: '/catalogo?type=NONDECANT', label: 'Nondecants' },
  { href: '/catalogo',              label: 'Combos' },
];

const LINKS_COL2 = [
  { href: '#', label: 'Acerca de' },
  { href: '#', label: 'Sucursales' },
  { href: '#', label: 'Blog' },
  { href: '#', label: 'Bajo pedido' },
  { href: '#', label: 'FAQ' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[--color-bg] border-t border-[--color-border]">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Columna marca */}
          <div className="md:col-span-1">
            <p className="font-heading text-xl text-[--color-text] uppercase tracking-[0.08em] mb-1">
              Nön<span className="text-[--color-accent]">Decants</span>
            </p>
            <p className="text-[--color-text-muted] text-xs leading-relaxed mt-3 max-w-xs">
              Plataforma especializada en la venta de perfumes sellados, decants y nondecants en Ecuador.
              Cada fragancia, en el tamaño que necesitas.
            </p>

            {/* Social */}
            <div className="flex items-center gap-3 mt-5">
              {[
                {
                  href: '#', label: 'Instagram',
                  icon: <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z M17.5 6.5h.01 M7.5 2h9a5.5 5.5 0 0 1 5.5 5.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2z"/>,
                },
                {
                  href: '#', label: 'TikTok',
                  icon: <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>,
                },
                {
                  href: '#', label: 'Facebook',
                  icon: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>,
                },
              ].map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-8 h-8 flex items-center justify-center border border-[--color-border] text-[--color-text-muted] hover:border-[--color-accent] hover:text-[--color-accent] transition-colors"
                  style={{ borderRadius: 'var(--radius-sm)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    {s.icon}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Links col 1 */}
          <div>
            <p className="font-heading text-xs uppercase tracking-[0.2em] text-[--color-text] mb-4">
              Links
            </p>
            <ul className="space-y-2.5">
              {LINKS_COL1.map(l => (
                <li key={l.label}>
                  <a href={l.href} className="text-xs text-[--color-text-muted] hover:text-[--color-accent] transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Links col 2 */}
          <div>
            <p className="font-heading text-xs uppercase tracking-[0.2em] text-[--color-text] mb-4">
              Links
            </p>
            <ul className="space-y-2.5">
              {LINKS_COL2.map(l => (
                <li key={l.label}>
                  <a href={l.href} className="text-xs text-[--color-text-muted] hover:text-[--color-accent] transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <p className="font-heading text-xs uppercase tracking-[0.2em] text-[--color-text] mb-4">
              Contacto
            </p>
            <ul className="space-y-3 text-xs text-[--color-text-muted]">
              <li className="flex items-start gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mt-0.5 shrink-0 text-[--color-accent]">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.65 3.18 2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                +593 99 000 0000
              </li>
              <li className="flex items-start gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mt-0.5 shrink-0 text-[--color-accent]">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                contacto@nondecants.ec
              </li>
              <li className="flex items-start gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mt-0.5 shrink-0 text-[--color-accent]">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                Daule, Ecuador
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[--color-border]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[10px] text-[--color-text-muted]">
            © {year} NönDecants. All rights reserved. Made by Shopwishi.
          </p>
          {/* Payment badges */}
          <div className="flex items-center gap-2">
            {['VISA', 'MC', 'PP'].map(badge => (
              <span
                key={badge}
                className="px-2 py-1 text-[9px] font-heading tracking-wider bg-[--color-surface] border border-[--color-border] text-[--color-text-muted]"
                style={{ borderRadius: 'var(--radius-sm)' }}
              >
                {badge}
              </span>
            ))}
            <span
              className="px-2 py-1 text-[9px] font-heading tracking-wider bg-[--color-accent] text-[--color-bg]"
              style={{ borderRadius: 'var(--radius-sm)' }}
            >
              PAYPHONE
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
