'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Icon } from './Icon';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, title, message, duration = 4000 }: Omit<ToastItem, 'id'>) => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setToasts((prev) => [...prev, { id, type, title, message, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast],
  );

  const success = useCallback((title: string, message?: string) => {
    showToast({ type: 'success', title, message });
  }, [showToast]);

  const error = useCallback((title: string, message?: string) => {
    showToast({ type: 'error', title, message, duration: 5000 });
  }, [showToast]);

  const warning = useCallback((title: string, message?: string) => {
    showToast({ type: 'warning', title, message, duration: 4500 });
  }, [showToast]);

  const info = useCallback((title: string, message?: string) => {
    showToast({ type: 'info', title, message });
  }, [showToast]);

  return (
    <ToastContext.Provider
      value={{ toasts, showToast, removeToast, success, error, warning, info }}
    >
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const ToastContainer: React.FC<{
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}> = ({ toasts, onRemove }) => {
  return (
    <aside aria-label="Thông báo hệ thống" className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-md w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onClose={() => onRemove(toast.id)} />
      ))}
    </aside>
  );
};

const ToastCard: React.FC<{
  toast: ToastItem;
  onClose: () => void;
}> = ({ toast, onClose }) => {
  const config = {
    success: {
      bg: 'bg-[#064E3B]/95 border-emerald-500/40 text-emerald-100',
      icon: 'check_circle',
      iconColor: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/20 text-emerald-300',
      barColor: 'bg-emerald-400',
    },
    error: {
      bg: 'bg-[#7F1D1D]/95 border-rose-500/40 text-rose-100',
      icon: 'error',
      iconColor: 'text-rose-400',
      badgeBg: 'bg-rose-500/20 text-rose-300',
      barColor: 'bg-rose-400',
    },
    warning: {
      bg: 'bg-[#78350F]/95 border-amber-500/40 text-amber-100',
      icon: 'warning',
      iconColor: 'text-amber-400',
      badgeBg: 'bg-amber-500/20 text-amber-300',
      barColor: 'bg-amber-400',
    },
    info: {
      bg: 'bg-[#1E293B]/95 border-sky-500/40 text-sky-100',
      icon: 'info',
      iconColor: 'text-sky-400',
      badgeBg: 'bg-sky-500/20 text-sky-300',
      barColor: 'bg-sky-400',
    },
  }[toast.type];

  return (
    <div
      role="alert"
      className={`pointer-events-auto flex items-start gap-3.5 p-4 rounded-xl border shadow-2xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${config.bg}`}
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${config.badgeBg}`}>
        <Icon name={config.icon} className={`text-[22px] ${config.iconColor}`} />
      </div>

      <div className="flex-1 min-w-0 pr-2">
        <h4 className="font-headline-sm text-body-md font-bold text-white leading-tight">
          {toast.title}
        </h4>
        {toast.message && (
          <p className="text-body-sm text-white/80 mt-1 leading-relaxed text-[13px]">
            {toast.message}
          </p>
        )}
      </div>

      <button
        onClick={onClose}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors shrink-0"
        title="Đóng thông báo"
      >
        <Icon name="close" className="text-[18px]" />
      </button>
    </div>
  );
};
