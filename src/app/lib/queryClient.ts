import { QueryClient } from '@tanstack/react-query';

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}

// En el navegador: singleton compartido entre todos los islands (un solo cache
// por página). En el servidor NUNCA se comparte: el proceso de Node atiende a
// todos los visitantes y un cliente global dejaría los datos de una visita
// (banners viejos, datos de otro usuario) en el HTML de las siguientes.
let browserClient: QueryClient | undefined;

export function getQueryClient(): QueryClient {
  if (typeof window === 'undefined') return createQueryClient();
  browserClient ??= createQueryClient();
  return browserClient;
}

export const queryClient = getQueryClient();
