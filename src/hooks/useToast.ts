import { useCallback, useState } from 'react';
import type { ToastMessage } from '../types/crypto';

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback((message: string, tone: ToastMessage['tone'] = 'neutral') => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => removeToast(id), 3400);
  }, [removeToast]);

  return { toasts, pushToast, removeToast };
}
