/**
 * Bloque de valoraciones del home: va justo después del blog.
 * El sello oficial de Merchant Center sigue siendo el widget flotante
 * (Google no permite incrustarlo). Este bloque es el lugar editorial
 * donde presentamos las reseñas verificadas.
 */
export default function GoogleReviewsSection() {
  return (
    <section
      id="valoraciones"
      className="bg-bg-alt py-[clamp(36px,4.5vw,64px)]"
    >
      <div className="mx-auto flex max-w-[720px] flex-col items-center px-[max(16px,3.4vw)] text-center">
        <span className="eyebrow k">Clientes verificados por Google</span>
        <h2 className="mt-2 font-display text-[clamp(28px,3.2vw,46px)] font-normal leading-none tracking-[-0.02em] text-text">
          Valoraciones.
        </h2>
        <p className="mt-3 max-w-md font-body text-[15px] leading-relaxed text-text-muted">
          Opiniones reales de compradores en Ecuador. El sello lo emite Google, no
          nosotros.
        </p>
        <div id="google-customer-reviews-badge" className="mt-6 flex justify-center" />
      </div>
    </section>
  );
}
