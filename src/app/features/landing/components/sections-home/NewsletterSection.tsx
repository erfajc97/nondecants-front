import { useState } from 'react';
import LogoIconSvg from '@/assets/LogoIconSvg';
import axiosInstance from '@/app/config/axiosConfig';
import { API_ENDPOINTS } from '@/app/api/endpoints';
import { toast } from 'sonner';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Por favor ingresa un correo electrónico válido.');
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post(API_ENDPOINTS.NEWSLETTER_SUBSCRIBE, { email });
      setSubmitted(true);
      toast.success('¡Te has suscrito exitosamente!');
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Error al suscribirse. Intenta de nuevo.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full bg-white py-10 md:py-16">
      {/* Imagen full-width con overlay y form encima */}
      <div className="relative overflow-hidden mx-auto">
        <img
          src="/img-subs.webp"
          alt=""
          className="w-full h-72 sm:h-[400px] lg:h-[450px] object-cover"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-black/40" />

        <div className="absolute inset-0 z-10 mx-auto w-full max-w-8xl px-4 lg:px-28 flex flex-col justify-center gap-6">
          {/* Logo + línea con punta */}
          <div className="flex flex-col items-start gap-4">
            <LogoIconSvg width={420} height={66} />
            <svg width="420" height="4" viewBox="0 0 420 4" fill="none">
              <line x1="0" y1="2" x2="416" y2="2" stroke="white" strokeWidth="1.5" />
              <polygon points="416,0 420,2 416,4" fill="white" />
            </svg>
          </div>

          {/* Form centrado */}
          <div className="flex justify-center w-full">
            {submitted ? (
              <p className="text-white font-heading uppercase tracking-wider text-lg">
                ¡Gracias! Te avisaremos con las novedades.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-4 lg:gap-6 w-full max-w-3xl">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Tu correo electrónico"
                  required
                  disabled={loading}
                  className="flex-1 w-full px-6 py-4 bg-white text-bg placeholder:text-text-muted text-base md:text-lg focus:outline-none rounded-md"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-4 bg-black text-white font-heading text-sm md:text-base uppercase tracking-widest hover:bg-black/80 transition-colors shrink-0 whitespace-nowrap rounded-md disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Enviando...' : 'Suscribirme a NonDecants'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
