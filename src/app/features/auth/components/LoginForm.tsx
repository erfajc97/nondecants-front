import { useState } from 'react';
import { useLoginMutation } from '../mutations/useLoginMutation';

interface LoginFormProps {
  onSuccess: () => void;
  onSwitchToRegister: () => void;
}

export default function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepSession, setKeepSession] = useState(false);

  const { mutate: login, isPending } = useLoginMutation(onSuccess);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password, keepSession });
  };

  const inputClass = "w-full px-4 py-3 bg-[--color-bg] border border-[--color-border] text-[--color-text] placeholder:text-[--color-text-muted] text-sm focus:outline-none focus:border-[--color-accent] transition-colors";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs text-[--color-text-muted] mb-1.5 uppercase tracking-wider">Email</label>
        <input
          type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com" required
          className={inputClass} style={{ borderRadius: 'var(--radius-sm)' }}
        />
      </div>
      <div>
        <label className="block text-xs text-[--color-text-muted] mb-1.5 uppercase tracking-wider">Contraseña</label>
        <input
          type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••" required
          className={inputClass} style={{ borderRadius: 'var(--radius-sm)' }}
        />
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox" checked={keepSession} onChange={(e) => setKeepSession(e.target.checked)}
          className="accent-[--color-accent] w-4 h-4"
        />
        <span className="text-sm text-[--color-text-muted]">Mantener sesión</span>
      </label>

      <button
        type="submit" disabled={isPending}
        className="w-full py-3.5 bg-[--color-accent] text-[--color-bg] font-heading uppercase tracking-widest text-sm hover:bg-[--color-accent-hover] transition-colors disabled:opacity-60"
        style={{ borderRadius: 'var(--radius-sm)' }}
      >
        {isPending ? 'Ingresando...' : 'Ingresar'}
      </button>

      <p className="text-center text-sm text-[--color-text-muted]">
        ¿No tienes cuenta?{' '}
        <button type="button" onClick={onSwitchToRegister} className="text-[--color-accent] hover:underline">
          Regístrate
        </button>
      </p>
    </form>
  );
}
