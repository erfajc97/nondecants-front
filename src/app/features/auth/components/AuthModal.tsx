import { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPasswordForm from './ForgotPasswordForm';

type AuthMode = 'login' | 'register' | 'forgot';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('login');

  if (!open) return null;

  const handleClose = () => {
    onClose();
    setTimeout(() => setMode('login'), 300);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-text/60 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
      >
        {/* Solo el formulario: el panel con la foto se quitó, así que la caja
            es angosta y centrada en lugar de partida en dos. */}
        <div
          className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-[4px] bg-bg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full text-text-muted transition-colors hover:bg-bg-alt hover:text-text"
            aria-label="Cerrar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          <div className="max-h-[90vh] overflow-y-auto px-8 py-10 sm:px-10 sm:py-12">
            {/* Wordmark */}
            <div className="mb-8 flex justify-center">
              <img src="/logonondecants.png" alt="NönDecants" width={543} height={127} className="h-8 w-auto" />
            </div>

            {mode === 'login' && (
              <LoginForm
                onSuccess={handleClose}
                onSwitchToRegister={() => setMode('register')}
                onSwitchToForgot={() => setMode('forgot')}
              />
            )}
            {mode === 'register' && (
              <RegisterForm
                onSuccess={handleClose}
                onSwitchToLogin={() => setMode('login')}
              />
            )}
            {mode === 'forgot' && (
              <ForgotPasswordForm
                onSwitchToLogin={() => setMode('login')}
              />
            )}
          </div>

        </div>
      </div>
    </>
  );
}
