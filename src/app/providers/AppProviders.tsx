import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { queryClient } from '@/app/lib/queryClient';

interface AppProvidersProps {
  children: React.ReactNode;
  withToaster?: boolean;
}

// Envuelve cada island con QueryClientProvider usando el singleton.
// withToaster=true solo en el island raíz de cada página (ej. Navbar)
// para evitar múltiples instancias del portal de toasts.
export default function AppProviders({ children, withToaster = false }: AppProvidersProps) {
  return (
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
  );
}
