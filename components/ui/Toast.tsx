'use client';

import { useEffect, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

const icons: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const typeClasses: Record<ToastType, string> = {
  success: 'border-[var(--success-border)] bg-[var(--success-dim)]',
  error: 'border-[var(--error-border)] bg-[var(--error-dim)]',
  info: 'border-[rgba(0,180,216,0.20)] bg-[var(--primary-dim)]',
};

const iconClasses: Record<ToastType, string> = {
  success: 'text-[var(--success)]',
  error: 'text-[var(--error)]',
  info: 'text-[var(--secondary)]',
};

// Global toast state
let addToastGlobal: ((type: ToastType, message: string) => void) | null = null;

export function toast(type: ToastType, message: string) {
  addToastGlobal?.(type, message);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  useEffect(() => {
    addToastGlobal = addToast;
    return () => {
      addToastGlobal = null;
    };
  }, [addToast]);

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => {
        const Icon = icons[t.type];
        return (
          <div
            key={t.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${typeClasses[t.type]} animate-in slide-in-from-bottom-4 shadow-lg max-w-sm`}
          >
            <Icon size={18} className={iconClasses[t.type]} />
            <span className="text-sm text-[var(--text-primary)] flex-1">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
