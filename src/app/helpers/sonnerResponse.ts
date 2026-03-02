import { toast } from 'sonner';

type ToastType = 'success' | 'error' | 'loading';

export const sonnerResponse = (message: string, type: ToastType): void => {
  const opts = { duration: 3000, position: 'top-right' as const };
  switch (type) {
    case 'success': toast.success(message, opts); break;
    case 'error':   toast.error(message, opts);   break;
    case 'loading': toast.loading(message, { ...opts, duration: 2000 }); break;
  }
};
