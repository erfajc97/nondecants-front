import { useEffect, useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import AppProviders from '@/app/providers/AppProviders';
import axiosInstance from '@/app/config/axiosConfig';
import { API_ENDPOINTS } from '@/app/api/endpoints';
import { DEMO_ENABLED } from '@/app/lib/mock';
import { useAuthStore } from '@/app/store/auth/authStore';
import GoogleIcon from '@/assets/svg/GoogleIcon';
import Loader from '@/app/components/Loader';
import { useLoginMutation } from '../mutations/useLoginMutation';
import { useRegisterMutation } from '../mutations/useRegisterMutation';
import { useLogoutMutation } from '../mutations/useLogoutMutation';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { useForgotPasswordHook } from '../hooks/useForgotPasswordHook';
import { authService } from '../services/authService';
import { sonnerResponse } from '@/app/helpers/sonnerResponse';
import AccountIcon, { type IconName } from './AccountIcons';
import '@/app/features/checkout/checkout.css';

type Tab = 'login' | 'register';

const FIELD =
  'h-14 w-full rounded-md border-2 border-border bg-surface px-3.5 font-body text-[17px] text-text placeholder:text-text-muted transition-colors focus:border-text focus:outline-none';
const LABEL = 'mb-1.5 block font-body text-base font-semibold text-text';
const BTN_MAIN =
  'inline-flex h-14 w-full items-center justify-center rounded-sm bg-text font-body text-[15px] font-semibold text-bg transition-[background-color,transform] duration-200 hover:bg-text-soft active:scale-[0.97] disabled:opacity-60';

const BENEFITS: { icon: IconName; title: string; text: string }[] = [
  { icon: 'truck', title: 'Sigue tus pedidos', text: 'Mira en qué etapa va cada envío, sin escribirnos.' },
  { icon: 'pin', title: 'Direcciones guardadas', text: 'Compra más rápido: tus datos ya están listos.' },
  { icon: 'heart', title: 'Tus favoritos', text: 'Guarda los perfumes que quieres probar después.' },
  { icon: 'gift', title: 'Novedades primero', text: 'Te avisamos de lanzamientos y combos antes que a nadie.' },
];

/** "Continuar con Google" a 54 px: el botón oficial va invisible encima y recibe el clic. */
function GoogleButton({ onSuccess }: { onSuccess: () => void }) {
  const { handleGoogleSuccess, handleGoogleError } = useGoogleAuth(onSuccess);
  return (
    <div className="relative h-[54px]">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center gap-3 rounded-sm border-2 border-border bg-surface font-body text-[15px] font-semibold text-text"
      >
        <GoogleIcon width={22} height={22} />
        Continuar con Google
      </span>
      <div className="absolute inset-0 flex origin-center scale-y-[1.4] items-center justify-center overflow-hidden opacity-[0.01]">
        <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} size="large" width="400" />
      </div>
    </div>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder,
  minLength,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  minLength?: number;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className={LABEL}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          minLength={minLength}
          required
          autoComplete={id === 'acc-pass-login' ? 'current-password' : 'new-password'}
          className={`${FIELD} pr-20`}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-pressed={show}
          className="absolute right-1.5 top-1/2 h-11 -translate-y-1/2 px-3.5 font-body text-[14px] font-semibold text-text-muted transition-colors hover:text-text"
        >
          {show ? 'Ocultar' : 'Ver'}
        </button>
      </div>
    </div>
  );
}

function LoginPane({ onForgot }: { onForgot: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keep, setKeep] = useState(false);
  const { mutate: login, isPending } = useLoginMutation();

  return (
    <div className="flex flex-col gap-5">
      <GoogleButton onSuccess={() => {}} />
      <div className="flex items-center gap-4" role="separator">
        <span className="h-px flex-1 bg-border" />
        <span className="font-body text-[13px] font-semibold text-text-muted">o con tu correo</span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          login({ email, password, keepSession: keep });
        }}
      >
        <div>
          <label htmlFor="acc-email-login" className={LABEL}>
            Correo
          </label>
          <input
            id="acc-email-login"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tucorreo@ejemplo.com"
            className={FIELD}
          />
        </div>
        <PasswordField id="acc-pass-login" label="Contraseña" value={password} onChange={setPassword} />
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <label className="flex cursor-pointer items-center gap-2.5 font-body text-[15px] text-text-soft">
            <input type="checkbox" checked={keep} onChange={(e) => setKeep(e.target.checked)} className="h-[18px] w-[18px] accent-text" />
            Mantener mi sesión abierta
          </label>
          <button
            type="button"
            onClick={onForgot}
            className="font-body text-[15px] font-semibold text-text underline underline-offset-4 hover:text-accent-hover"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
        <button type="submit" disabled={isPending} className={BTN_MAIN}>
          {isPending ? <Loader size={18} color="#fff" className="mx-auto" /> : 'Entrar'}
        </button>
      </form>
      <p className="rounded-md bg-gold-light px-4 py-3 text-center font-body text-[14.5px] text-text-soft">
        ¿Solo quieres comprar? No necesitas cuenta: puedes pagar como invitado.
      </p>
    </div>
  );
}

function RegisterPane() {
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sent, setSent] = useState(false);
  const [resending, setResending] = useState(false);
  const { mutate: register, isPending } = useRegisterMutation(() => setSent(true));

  const resend = async () => {
    setResending(true);
    try {
      await authService.resendVerification(email);
      sonnerResponse('Correo de verificación reenviado.', 'success');
    } catch {
      sonnerResponse('No pudimos reenviarlo. Intenta de nuevo.', 'error');
    } finally {
      setResending(false);
    }
  };

  if (sent) {
    return (
      <div className="py-4 text-center">
        <h3 className="font-display text-[26px] font-normal leading-tight text-text">Revisa tu correo</h3>
        <p className="mt-2 font-body text-[15px] text-text-soft">
          Te enviamos un enlace de verificación a <b className="break-all text-text">{email}</b>.
        </p>
        <button
          type="button"
          onClick={resend}
          disabled={resending}
          className="mt-4 font-body text-[15px] font-semibold text-text underline underline-offset-4 hover:text-accent-hover"
        >
          {resending ? 'Reenviando…' : '¿No te llegó? Reenviar correo'}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <GoogleButton onSuccess={() => {}} />
      <div className="flex items-center gap-4" role="separator">
        <span className="h-px flex-1 bg-border" />
        <span className="font-body text-[13px] font-semibold text-text-muted">o con tu correo</span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          register({ firstName: name, lastName, email, password });
        }}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="acc-name" className={LABEL}>
              Nombres
            </label>
            <input id="acc-name" type="text" autoComplete="given-name" required value={name} onChange={(e) => setName(e.target.value)} className={FIELD} />
          </div>
          <div>
            <label htmlFor="acc-last" className={LABEL}>
              Apellidos
            </label>
            <input id="acc-last" type="text" autoComplete="family-name" required value={lastName} onChange={(e) => setLastName(e.target.value)} className={FIELD} />
          </div>
        </div>
        <div>
          <label htmlFor="acc-email-reg" className={LABEL}>
            Correo
          </label>
          <input
            id="acc-email-reg"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tucorreo@ejemplo.com"
            className={FIELD}
          />
        </div>
        <PasswordField id="acc-pass-reg" label="Contraseña" value={password} onChange={setPassword} placeholder="Mínimo 6 caracteres" minLength={6} />
        <button type="submit" disabled={isPending} className={BTN_MAIN}>
          {isPending ? <Loader size={18} color="#fff" className="mx-auto" /> : 'Crear cuenta'}
        </button>
      </form>
      <p className="rounded-md bg-gold-light px-4 py-3 text-center font-body text-[14.5px] text-text-soft">
        ¿Solo quieres comprar? No necesitas cuenta: puedes pagar como invitado.
      </p>
    </div>
  );
}

function ForgotPane({ onBack }: { onBack: () => void }) {
  const { email, setEmail, sent, isPending, handleSubmit } = useForgotPasswordHook();
  return (
    <div className="flex flex-col gap-5">
      <p className="font-body text-[15px] text-text-soft">
        {sent
          ? `Si ${email} está registrado, recibirás un enlace para crear una contraseña nueva.`
          : 'Escribe tu correo y te enviamos un enlace para crear una contraseña nueva.'}
      </p>
      {!sent && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="acc-email-forgot" className={LABEL}>
              Correo
            </label>
            <input
              id="acc-email-forgot"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tucorreo@ejemplo.com"
              className={FIELD}
            />
          </div>
          <button type="submit" disabled={isPending} className={BTN_MAIN}>
            {isPending ? <Loader size={18} color="#fff" className="mx-auto" /> : 'Enviar enlace'}
          </button>
        </form>
      )}
      <button type="button" onClick={onBack} className="font-body text-[15px] font-semibold text-text underline underline-offset-4 hover:text-accent-hover">
        Volver a entrar
      </button>
    </div>
  );
}

/** Tarjeta con selector deslizable Entrar / Crear cuenta (A1). */
function AuthCard() {
  const [tab, setTab] = useState<Tab>('login');
  const [forgot, setForgot] = useState(false);
  const isLogin = tab === 'login';

  return (
    <div className="rounded-md border border-border bg-surface p-5 md:p-8">
      <div role="tablist" aria-label="Acceso a tu cuenta" className="relative grid h-[52px] grid-cols-2 rounded-full bg-bg-alt p-1">
        <span
          aria-hidden="true"
          className="absolute bottom-1 left-1 top-1 w-[calc(50%-4px)] rounded-full bg-text transition-transform duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
          style={{ transform: `translateX(${isLogin ? 0 : 100}%)` }}
        />
        {(['login', 'register'] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            id={`acc-tab-${t}`}
            aria-selected={tab === t}
            aria-controls="acc-pane"
            onClick={() => {
              setTab(t);
              setForgot(false);
            }}
            className={`relative z-[1] rounded-full font-body text-[15px] font-semibold transition-colors duration-300 ${
              tab === t ? 'text-bg' : 'text-text-soft hover:text-text'
            }`}
          >
            {t === 'login' ? 'Entrar' : 'Crear cuenta'}
          </button>
        ))}
      </div>

      <h1 className="mt-6 font-display text-[clamp(32px,3.4vw,44px)] font-normal leading-none text-text">
        {forgot ? 'Recupera tu acceso' : isLogin ? 'Bienvenido de vuelta' : 'Únete a NonDecants'}
      </h1>
      <p className="mb-6 mt-2 font-body text-[15px] text-text-muted">
        {isLogin ? 'Entra para ver tus pedidos y comprar más rápido.' : 'Crea tu cuenta en un minuto.'}
      </p>

      <div id="acc-pane" role="tabpanel" aria-labelledby={`acc-tab-${tab}`} key={`${tab}-${forgot}`} className="ck-step-in">
        {forgot ? <ForgotPane onBack={() => setForgot(false)} /> : isLogin ? <LoginPane onForgot={() => setForgot(true)} /> : <RegisterPane />}
      </div>
    </div>
  );
}

/** Beneficios de tener cuenta: a un lado en escritorio, debajo en móvil. */
function Benefits() {
  return (
    <ul className="flex flex-col gap-6 md:py-4">
      {BENEFITS.map((b) => (
        <li key={b.title} className="flex items-start gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-text text-bg">
            <AccountIcon name={b.icon} />
          </span>
          <span>
            <b className="block font-body text-[17px] font-semibold text-text">{b.title}</b>
            <span className="mt-0.5 block font-body text-[15px] leading-snug text-text-muted">{b.text}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

const LINKS: { icon: IconName; label: string; href?: string; external?: boolean }[] = [
  { icon: 'bag', label: 'Mis pedidos', href: '/mi-cuenta' },
  { icon: 'heart', label: 'Favoritos' },
  { icon: 'pin', label: 'Direcciones', href: '/mi-cuenta' },
  { icon: 'star', label: 'Mis reseñas' },
  { icon: 'help', label: 'Ayuda', href: 'https://wa.me/593992305463', external: true },
];

/** Panel con sesión (A3): "Hola, [nombre]." y accesos. */
function AccountPanel() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const { mutate: logout, isPending } = useLogoutMutation();

  // Tras recargar la página el usuario no está en memoria: se pide el perfil.
  useEffect(() => {
    if (user || DEMO_ENABLED) return;
    axiosInstance
      .get(API_ENDPOINTS.USER_ME)
      .then(({ data }) => {
        const u = data?.data ?? data;
        if (u?.email) setUser(u);
      })
      .catch(() => {});
  }, [user, setUser]);

  // En la demo no hay perfil real: se muestran datos de ejemplo.
  const firstName = user?.firstName || user?.name?.split(' ')[0] || (DEMO_ENABLED ? 'Camila' : '');
  const email = user?.email || (DEMO_ENABLED ? 'camila@ejemplo.com' : '');

  return (
    <div className="mx-auto max-w-[640px] rounded-md border border-border bg-surface p-6 md:p-10">
      <p className="font-body text-sm font-semibold uppercase tracking-[0.08em] text-text-muted">Mi cuenta</p>
      <h1 className="mt-2 font-display text-[clamp(36px,4.4vw,52px)] font-normal leading-none text-text">
        Hola, <span className="text-accent">{firstName || 'bienvenido'}</span>.
      </h1>
      {email && <p className="mt-2 break-all font-body text-base text-text-muted">{email}</p>}

      <ul className="mt-8 divide-y divide-border border-y border-border">
        {LINKS.map((l) => {
          const inner = (
            <>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-text text-bg">
                <AccountIcon name={l.icon} />
              </span>
              <span className="flex-1 font-body text-[17px] font-semibold text-text">{l.label}</span>
              {l.href ? (
                <AccountIcon name="chevron" className="h-5 w-5 text-text-muted" />
              ) : (
                <span className="rounded-full bg-bg-alt px-2.5 py-1 font-body text-[12px] font-semibold text-text-muted">Pronto</span>
              )}
            </>
          );
          return (
            <li key={l.label}>
              {l.href ? (
                <a
                  href={l.href}
                  target={l.external ? '_blank' : undefined}
                  rel={l.external ? 'noopener' : undefined}
                  className="flex items-center gap-4 py-4 transition-colors hover:bg-bg-alt/60"
                >
                  {inner}
                </a>
              ) : (
                <div className="flex items-center gap-4 py-4 opacity-80">{inner}</div>
              )}
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={() => logout()}
        disabled={isPending}
        className="mt-6 inline-flex h-[52px] w-full items-center justify-center rounded-sm border-[1.5px] border-text font-body text-[14.5px] font-semibold text-text transition-[background-color,transform] duration-200 hover:bg-bg-alt active:scale-[0.97] disabled:opacity-60"
      >
        Cerrar sesión
      </button>
    </div>
  );
}

function AccountContent() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  // Evita parpadear el formulario a quien ya tiene sesión: el estado real solo se conoce en el cliente.
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  if (!ready) return <div className="min-h-[560px]" aria-hidden="true" />;
  if (isAuthenticated) return <AccountPanel />;

  return (
    <div className="mx-auto grid max-w-[1100px] grid-cols-1 items-start gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-14">
      <AuthCard />
      <Benefits />
    </div>
  );
}


export default function AccountPage() {
  return (
    <AppProviders>
      <section className="bg-bg-alt px-4 py-8 md:px-[clamp(16px,3.4vw,52px)] md:py-14">
        <AccountContent />
      </section>
    </AppProviders>
  );
}
