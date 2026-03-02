import { QueryClient } from '@tanstack/react-query';

// Singleton compartido entre todos los islands.
// Al ser un módulo, el bundler garantiza una sola instancia por página → cache unificado.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
