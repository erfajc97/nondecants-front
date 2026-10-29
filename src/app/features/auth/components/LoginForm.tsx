import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useLoginMutation } from '../mutations/useLoginMutation';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { AUTH_INPUT_CLASS, AUTH_SUBMIT_CLASS, AUTH_LABEL_CLASS } from '../data';
import EyeIcon from '@/assets/svg/EyeIcon';
import EyeOffIcon from '@/assets/svg/EyeOffIcon';
import GoogleIcon from '@/assets/svg/GoogleIcon';
import Loader from '@/app/components/Loader';

interface LoginFormProps {
  onSuccess: () => void;
  onSwitchToRegister: () => void;
  onSwitchToForgot: () => void;
}

export default function LoginForm({ onSuccess, onSwitchToRegister, onSwitchToForgot }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepSession, setKeepSession] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { mutate: login, isPending } = useLoginMutation(onSuccess);
  const { handleGoogleSuccess, handleGoogleError } = useGoogleAuth(onSuccess);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password, keepSession });
  };

  return (
    <div>
      {/* Title */}
      <h2 className="mb-1 text-center font-display text-3xl font-normal text-text">Bienvenido de vuelta</h2>
      <p className="mb-8 text-center font-body text-sm text-text-soft">Entra para comprar con tu cuenta</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div>
          <label className={AUTH_LABEL_CLASS}>Correo</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tucorreo@ejemplo.com"
            required
            className={AUTH_INPUT_CLASS}
          />
        </div>

        {/* Password */}
        <div>
          <label className={AUTH_LABEL_CLASS}>Contraseña</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className={`${AUTH_INPUT_CLASS} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-1 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-text"
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        {/* Keep session + Forgot */}
        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={keepSession}
              onChange={(e) => setKeepSession(e.target.checked)}
              className="h-4 w-4 accent-accent"
            />
            <span className="font-body text-xs text-text-soft">Mantener mi sesión abierta</span>
          </label>
          <button
            type="button"
            onClick={onSwitchToForgot}
            className="font-body text-xs text-text-soft transition-colors hover:text-accent"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className={AUTH_SUBMIT_CLASS}
        >
          {isPending ? <Loader size={18} color="#fff" className="mx-auto" /> : 'Entrar'}
        </button>

        {/* Divider */}
        <div className="my-2 flex items-center gap-4">
          <div className="h-px flex-1 bg-border" />
          <span className="font-body text-[13px] font-semibold text-text-muted">o</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Google */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            text="signin_with"
            size="large"
            theme="outline"
          />
        </div>

        {/* Crear cuenta: la acción secundaria del modal, con el tratamiento
            editorial del sitio en vez de un enlace suelto */}
        <div className="mt-4 border-t border-border pt-5 text-center">
          <p className="eyebrow mb-2 text-text-muted">¿Primera vez en NonDecants?</p>
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="w-full border border-text py-3.5 font-body text-[14.5px] font-semibold tracking-[0.01em] text-text transition-colors hover:bg-text hover:text-bg"
          >
            Crear cuenta
          </button>
        </div>
      </form>
    </div>
  );
}
