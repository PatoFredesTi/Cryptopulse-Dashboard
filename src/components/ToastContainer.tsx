import { CheckCircle2, Info, X, XCircle } from 'lucide-react';

const icons = {
  positive: CheckCircle2,
  negative: XCircle,
  neutral: Info,
};

export function ToastContainer({ toasts, onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div className="toast-stack" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => {
        const Icon = icons[toast.tone] ?? Info;
        return (
          <div key={toast.id} className={`toast-card ${toast.tone}`}>
            <Icon size={18} />
            <span>{toast.message}</span>
            <button type="button" onClick={() => onDismiss(toast.id)} aria-label="Dismiss notification">
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
