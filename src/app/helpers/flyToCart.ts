/**
 * Animación de "añadir al carrito" (prototipo): chispas doradas salen del botón
 * y la miniatura del producto vuela hasta el ícono del carrito del header, que
 * hace un pequeño rebote. El ícono se marca con `data-cart-target`.
 * Respeta `prefers-reduced-motion`.
 */
const reducedMotion = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Primer ícono de carrito visible (el del header; en mobile también está ahí). */
function cartTarget(): HTMLElement | null {
  const all = document.querySelectorAll<HTMLElement>('[data-cart-target]');
  for (const el of all) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) return el;
  }
  return null;
}

function sparks(x: number, y: number) {
  for (let k = 0; k < 14; k++) {
    const d = document.createElement('span');
    d.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:7px;height:7px;border-radius:50%;background:var(--color-accent);pointer-events:none;z-index:95;box-shadow:0 0 8px rgba(195,166,88,.8)`;
    document.body.appendChild(d);
    const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.3;
    const dist = 30 + Math.random() * 60;
    const sz = 0.4 + Math.random() * 0.9;
    d.animate(
      [
        { transform: `translate(-50%,-50%) scale(${sz})`, opacity: 1 },
        {
          transform: `translate(calc(-50% + ${Math.cos(a) * dist}px),calc(-50% + ${Math.sin(a) * dist}px)) scale(0)`,
          opacity: 0,
        },
      ],
      { duration: 650 + Math.random() * 350, easing: 'cubic-bezier(.22,1,.36,1)' },
    ).onfinish = () => d.remove();
  }
}

function flight(x: number, y: number, tx: number, ty: number, thumb?: string) {
  const size = thumb ? 56 : 14;
  const f = document.createElement(thumb ? 'img' : 'span');
  if (thumb) (f as HTMLImageElement).src = thumb;
  f.style.cssText = thumb
    ? `position:fixed;left:${x - size / 2}px;top:${y - size / 2}px;width:${size}px;height:${size}px;border-radius:50%;object-fit:contain;background:#fff;padding:4px;border:1.5px solid var(--color-accent);pointer-events:none;z-index:96;box-shadow:0 8px 22px rgba(27,25,25,.28)`
    : `position:fixed;left:${x - size / 2}px;top:${y - size / 2}px;width:${size}px;height:${size}px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#f3e2b0,var(--color-accent) 60%,#8c7330);pointer-events:none;z-index:96;box-shadow:0 4px 14px rgba(140,115,48,.5)`;
  document.body.appendChild(f);
  const dx = tx - x;
  const dy = ty - y;
  f.animate(
    [
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: `translate(${dx * 0.5}px,${dy * 0.5 - 80}px) scale(1.1)`, opacity: 1, offset: 0.5 },
      { transform: `translate(${dx}px,${dy}px) scale(.3)`, opacity: 0.6 },
    ],
    { duration: 750, easing: 'cubic-bezier(.5,0,.3,1)' },
  ).onfinish = () => f.remove();
}

function bump(target: HTMLElement) {
  target.animate(
    [{ transform: 'scale(1)' }, { transform: 'scale(1.28)' }, { transform: 'scale(1)' }],
    { duration: 420, easing: 'cubic-bezier(.34,1.56,.64,1)', delay: 700 },
  );
}

/**
 * @param source elemento desde el que sale (botón "Añadir", la card…); si es null no hace nada
 * @param thumb  imagen del producto que viaja; sin ella viaja un punto dorado
 */
export function flyToCart(source: Element | null, thumb?: string) {
  if (!source || typeof document === 'undefined' || reducedMotion()) return;
  const r = source.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return;
  const x = r.left + r.width / 2;
  const y = r.top + r.height / 2;
  sparks(x, y);
  const target = cartTarget();
  if (!target) return;
  const t = target.getBoundingClientRect();
  flight(x, y, t.left + t.width / 2, t.top + t.height / 2, thumb || undefined);
  bump(target);
}
