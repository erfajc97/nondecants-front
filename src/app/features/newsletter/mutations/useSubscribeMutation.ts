import { useMutation } from '@tanstack/react-query';
import { newsletterService, type SubscribePayload } from '../services/newsletterService';
import { sonnerResponse } from '@/app/helpers/sonnerResponse';

export function useSubscribeMutation(onSuccess?: () => void) {
  return useMutation({
    mutationFn: (payload: SubscribePayload) => newsletterService.subscribe(payload),
    onSuccess: () => {
      sonnerResponse('¡Listo! Te avisaremos con las novedades.', 'success');
      onSuccess?.();
    },
    onError: () => {
      sonnerResponse('No pudimos suscribirte. Intenta de nuevo.', 'error');
    },
  });
}
