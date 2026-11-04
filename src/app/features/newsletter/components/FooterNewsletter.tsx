import { useId, useState } from 'react';
import AppProviders from '@/app/providers/AppProviders';
import { useSubscribeMutation } from '../mutations/useSubscribeMutation';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function NewsletterForm() {
  const id = useId();
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const mutation = useSubscribeMutation(() => setDone(true));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) return setError('Ingresa un correo válido.');
    if (!consent) return setError('Debes aceptar para suscribirte.');
    setError('');
    mutation.mutate({ email: email.trim() });
  };

  if (done) {
    return <p className="mt-6 font-body text-sm text-accent">¡Gracias! Ya estás en la lista.</p>;
  }

  return (
    <form onSubmit={onSubmit} noValidate className="mt-6 max-w-[38ch]">
      <label htmlFor={`${id}-email`} className="mb-2 block font-body text-[13px] font-semibold text-accent">
        Novedades y lanzamientos
      </label>
      <div className="flex gap-2">
        <input
          id={`${id}-email`}
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Tu correo"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-err` : undefined}
          className="h-11 min-w-0 flex-1 rounded-[4px] border border-bg/30 bg-transparent px-3 font-body text-sm text-bg placeholder:text-bg/50 focus-visible:outline-2 focus-visible:outline-accent"
        />
        <button
          type="submit"
          disabled={mutation.isPending}
          className="h-11 shrink-0 rounded-[4px] bg-accent px-4 font-body text-sm font-semibold text-text transition-opacity disabled:opacity-60"
        >
          {mutation.isPending ? 'Enviando…' : 'Suscribirme'}
        </button>
      </div>
      <label className="mt-3 flex min-h-11 items-start gap-2 font-body text-xs leading-snug text-bg/60">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-accent"
        />
        <span>
          Acepto recibir novedades de NonDecants y la <a href="/privacidad" className="underline">política de privacidad</a>.
        </span>
      </label>
      {error && (
        <p id={`${id}-err`} role="alert" className="mt-1 font-body text-xs text-accent">
          {error}
        </p>
      )}
    </form>
  );
}

export default function FooterNewsletter() {
  return (
    <AppProviders withToaster={false}>
      <NewsletterForm />
    </AppProviders>
  );
}
