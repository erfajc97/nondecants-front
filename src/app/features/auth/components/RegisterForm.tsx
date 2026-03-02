import { useState } from 'react';
import { useRegisterMutation } from '../mutations/useRegisterMutation';

interface RegisterFormProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export default function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { mutate: register, isPending } = useRegisterMutation(onSuccess);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register({ name, email, password });
  };

  const inputClass = "w-full px-4 py-3 bg-[--color-bg] border border-[--color-border] text-[--color-text] placeholder:text-[--color-text-muted] text-sm focus:outline-none focus:border-[--color-accent] transition-colors";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs text-[--color-text-muted] mb-1.5 uppercase tracking-wider">Nombre</label>
        <input
          type="text" value={name} onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre" required
          className={inputClass} style={{ borderRadius: 'var(--radius-sm)' }}
        />
      </div>
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
          placeholder="••••••••" required minLength={6}
          className={inputClass} style={{ borderRadius: 'var(--radius-sm)' }}
        />
      </div>

      <button
        type="submit" disabled={isPending}
        className="w-full py-3.5 bg-[--color-accent] text-[--color-bg] font-heading uppercase tracking-widest text-sm hover:bg-[--color-accent-hover] transition-colors disabled:opacity-60"
        style={{ borderRadius: 'var(--radius-sm)' }}
      >
        {isPending ? 'Creando cuenta...' : 'Crear cuenta'}
      </button>

      <p className="text-center text-sm text-[--color-text-muted]">
        ¿Ya tienes cuenta?{' '}
        <button type="button" onClick={onSwitchToLogin} className="text-[--color-accent] hover:underline">
          Ingresar
        </button>
      </p>
    </form>
  );
}
