import { useState } from 'react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <section className="relative overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=1400&h=400&fit=crop&q=75"
          alt=""
          className="w-full h-full object-cover"
          aria-hidden="true"
        />
        <div className="absolute inset-0" style={{ background: 'rgba(27,25,25,0.82)' }} />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-20 text-center">
        {/* Logo estilizado */}
        <p
          className="font-heading text-4xl md:text-5xl text-[--color-text] mb-2 uppercase tracking-widest"
          style={{ letterSpacing: '0.08em' }}
        >
          Nön<span className="text-[--color-accent]">Decants</span>
        </p>
        <div className="w-12 h-px bg-[--color-accent] mx-auto mb-8" />

        <p className="text-[--color-text-muted] text-sm mb-8 max-w-sm mx-auto">
          Recibe primero las novedades, ofertas exclusivas y nuevas fragancias.
        </p>

        {submitted ? (
          <p className="text-[--color-success] font-heading uppercase tracking-wider text-sm">
            ¡Gracias! Te avisaremos con las novedades.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-0 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Tu correo electrónico"
              required
              className="flex-1 px-5 py-3.5 bg-[--color-text] text-[--color-bg] placeholder:text-[--color-text-muted] text-sm focus:outline-none focus:ring-2 ring-[--color-accent]"
              style={{ borderRadius: 'var(--radius-sm) 0 0 var(--radius-sm)' }}
            />
            <button
              type="submit"
              className="px-6 py-3.5 bg-[--color-accent] text-[--color-bg] font-heading text-xs uppercase tracking-widest hover:bg-[--color-accent-hover] transition-colors shrink-0 whitespace-nowrap"
              style={{ borderRadius: '0 var(--radius-sm) var(--radius-sm) 0' }}
            >
              Suscribirme a NönDecants
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
