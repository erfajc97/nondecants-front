import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { applyAuthSuccess } from '../helpers/applyAuthSuccess';
import { sonnerResponse } from '@/app/helpers/sonnerResponse';
import type { LoginPayload } from '../types';

export function useLoginMutation(onSuccess?: () => void) {
  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: (data, variables) => {
      applyAuthSuccess(data, variables.keepSession ?? false);
      sonnerResponse('¡Bienvenido!', 'success');
      onSuccess?.();
    },
    onError: () => {
      sonnerResponse('Correo o contraseña incorrectos.', 'error');
    },
  });
}
