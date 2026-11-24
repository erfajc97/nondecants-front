import { QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'sonner';
import { useState } from 'react';
import { getQueryClient } from '@/app/lib/queryClient';

interface AppProvidersProps {
  children: React.ReactNode;
  withToaster?: boolean;
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '119360093820-04jejigudrvho560gtnof02vnn71cqkj.apps.googleusercontent.com';

// Envuelve cada island con QueryClientProvider usando el singleton.
// withToaster=true solo en el island raíz de cada página (ej. Navbar)
// para evitar múltiples instancias del portal de toasts.
export default function AppProviders({ children, withToaster = false }: AppProvidersProps) {
  // Servidor: un cliente nuevo por render (no se comparte entre visitantes).
  // Navegador: el singleton de siempre.
  const [queryClient] = useState(getQueryClient);
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        {children}
        {withToaster && (
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)',
              },
            }}
          />
        )}
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}
