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
    onError: (error: any) => {
      // En la demo no hay backend: el aviso real es "ambiente de demostración".
      const demoMsg = error?.response?.status === 503 ? error?.response?.data?.message : null;
      sonnerResponse(demoMsg || 'Correo o contraseña incorrectos.', 'error');
    },
  });
}
