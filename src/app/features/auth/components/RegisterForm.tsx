import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useRegisterMutation } from '../mutations/useRegisterMutation';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { authService } from '../services/authService';
import { sonnerResponse } from '@/app/helpers/sonnerResponse';
import { AUTH_INPUT_CLASS, AUTH_SUBMIT_CLASS, AUTH_LABEL_CLASS } from '../data';
import EyeIcon from '@/assets/svg/EyeIcon';
import EyeOffIcon from '@/assets/svg/EyeOffIcon';
import Loader from '@/app/components/Loader';

interface RegisterFormProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export default function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [sent, setSent] = useState(false);
  const [resending, setResending] = useState(false);

  const { mutate: register, isPending } = useRegisterMutation(() => setSent(true));
  const { handleGoogleSuccess, handleGoogleError } = useGoogleAuth(onSuccess);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) return;
    register({ firstName: name, lastName, email, password });
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authService.resendVerification(email);
      sonnerResponse('Correo de verificación reenviado.', 'success');
    } catch {
      sonnerResponse('Error al reenviar. Intenta de nuevo.', 'error');
    } finally {
      setResending(false);
    }
  };

  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  if (sent) {
    return (
      <div className="text-center py-6">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <svg className="h-7 w-7 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="mb-2 font-display text-3xl font-normal text-text">Revisa tu bandeja de entrada</h2>
        <p className="mb-6 font-body text-sm text-text-soft">
          Te enviamos un enlace de verificación a <span className="text-text">{email}</span>
        </p>
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="mx-auto mb-4 block font-body text-sm text-text-soft transition-colors hover:text-accent"
        >
          {resending ? 'Reenviando...' : '¿No lo recibiste? Reenviar correo'}
        </button>
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-body text-sm text-text transition-colors hover:text-accent"
        >
          Volver a entrar
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Title */}
      <h2 className="mb-1 text-center font-display text-3xl font-normal text-text">Crear cuenta</h2>
      <p className="mb-7 text-center font-body text-sm text-text-soft">Regístrate para empezar a comprar</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={AUTH_LABEL_CLASS}>Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Juan"
              required
              className={AUTH_INPUT_CLASS}
            />
          </div>
          <div>
            <label className={AUTH_LABEL_CLASS}>Apellido</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Pérez"
              required
              className={AUTH_INPUT_CLASS}
            />
          </div>
        </div>

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

        {/* Phone */}
        <div>
          <label className={AUTH_LABEL_CLASS}>Teléfono</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="09X XXX XXXX"
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
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
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

        {/* Confirm Password */}
        <div>
          <label className={AUTH_LABEL_CLASS}>Confirmar contraseña</label>
          <input
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repite tu contraseña"
            required
            minLength={6}
            className={`w-full border-b bg-transparent px-1 py-2.5 font-body text-sm text-text placeholder:text-text-muted focus:outline-none transition-colors ${
              passwordMismatch ? 'border-error' : 'border-border focus:border-text'
            }`}
          />
          {passwordMismatch && (
            <p className="mt-1.5 font-body text-xs text-error">Las contraseñas no coinciden</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending || passwordMismatch}
          className={AUTH_SUBMIT_CLASS}
        >
          {isPending ? <Loader size={18} color="#fff" className="mx-auto" /> : 'Crear cuenta'}
        </button>

        {/* Divider */}
        <div className="my-1 flex items-center gap-4">
          <div className="h-px flex-1 bg-border" />
          <span className="font-body text-[13px] font-semibold text-text-muted">o</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Google */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            text="signup_with"
            size="large"
            theme="outline"
          />
        </div>

        {/* Switch to login */}
        <p className="mt-1 text-center font-body text-sm text-text-soft">
          ¿Ya tienes cuenta?{' '}
          <button type="button" onClick={onSwitchToLogin} className="border-b border-text pb-0.5 text-text transition-colors hover:border-accent hover:text-accent">
            Entrar
          </button>
        </p>
      </form>
    </div>
  );
}
