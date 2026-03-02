import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { useAuthStore } from '@/app/store/auth/authStore';
import { sonnerResponse } from '@/app/helpers/sonnerResponse';

export function useLogoutMutation() {
  const removeToken = useAuthStore((s) => s.removeToken);

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      // Siempre limpiar, incluso si el endpoint falla
      removeToken();
      sonnerResponse('Sesión cerrada.', 'success');
      window.location.href = '/';
    },
  });
}
