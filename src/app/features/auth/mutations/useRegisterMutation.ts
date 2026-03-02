import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { applyAuthSuccess } from '../helpers/applyAuthSuccess';
import { sonnerResponse } from '@/app/helpers/sonnerResponse';
import type { RegisterPayload } from '../types';

export function useRegisterMutation(onSuccess?: () => void) {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess: (data) => {
      applyAuthSuccess(data, false);
      sonnerResponse('¡Cuenta creada exitosamente!', 'success');
      onSuccess?.();
    },
    onError: () => {
      sonnerResponse('Error al crear la cuenta. El correo puede estar en uso.', 'error');
    },
  });
}
