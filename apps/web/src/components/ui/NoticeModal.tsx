'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Icon } from './Icon';
import { Button } from './Button';

export type NoticeType = 'success' | 'warning' | 'error' | 'info';

export interface NoticeDetail {
  label: string;
  value: string;
  isHighlight?: boolean;
}

export interface NoticeOptions {
  type?: NoticeType;
  title: string;
  message: string;
  details?: NoticeDetail[];
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
}

interface NoticeContextType {
  showNotice: (options: NoticeOptions) => void;
  closeNotice: () => void;
  showSuccess: (title: string, message: string, details?: NoticeDetail[]) => void;
  showWarning: (title: string, message: string, details?: NoticeDetail[]) => void;
  showError: (title: string, message: string, details?: NoticeDetail[]) => void;
  showInfo: (title: string, message: string, details?: NoticeDetail[]) => void;
}

const NoticeContext = createContext<NoticeContextType | undefined>(undefined);

export const NoticeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentNotice, setCurrentNotice] = useState<NoticeOptions | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const closeNotice = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => {
      setCurrentNotice(null);
    }, 200);
  }, []);

  const showNotice = useCallback((options: NoticeOptions) => {
    setCurrentNotice(options);
    setIsOpen(true);
  }, []);

  const showSuccess = useCallback(
    (title: string, message: string, details?: NoticeDetail[]) => {
      showNotice({ type: 'success', title, message, details });
    },
    [showNotice]
  );

  const showWarning = useCallback(
    (title: string, message: string, details?: NoticeDetail[]) => {
      showNotice({ type: 'warning', title, message, details });
    },
    [showNotice]
  );

  const showError = useCallback(
    (title: string, message: string, details?: NoticeDetail[]) => {
      showNotice({ type: 'error', title, message, details });
    },
    [showNotice]
  );

  const showInfo = useCallback(
    (title: string, message: string, details?: NoticeDetail[]) => {
      showNotice({ type: 'info', title, message, details });
    },
    [showNotice]
  );

  const handlePrimary = () => {
    if (currentNotice?.onPrimaryClick) {
      currentNotice.onPrimaryClick();
    }
    closeNotice();
  };

  const handleSecondary = () => {
    if (currentNotice?.onSecondaryClick) {
      currentNotice.onSecondaryClick();
    }
    closeNotice();
  };

  const type = currentNotice?.type || 'info';

  const typeConfig = {
    success: {
      icon: 'check_circle',
      iconColor: 'text-emerald-500',
      badgeBg: 'bg-emerald-500/10 border-emerald-500/30',
      ringColor: 'ring-emerald-500/20',
      btnVariant: 'primary' as const,
    },
    warning: {
      icon: 'warning',
      iconColor: 'text-amber-500',
      badgeBg: 'bg-amber-500/10 border-amber-500/30',
      ringColor: 'ring-amber-500/20',
      btnVariant: 'primary' as const,
    },
    error: {
      icon: 'gavel',
      iconColor: 'text-rose-500',
      badgeBg: 'bg-rose-500/10 border-rose-500/30',
      ringColor: 'ring-rose-500/20',
      btnVariant: 'destructive' as const,
    },
    info: {
      icon: 'info',
      iconColor: 'text-blue-500',
      badgeBg: 'bg-blue-500/10 border-blue-500/30',
      ringColor: 'ring-blue-500/20',
      btnVariant: 'primary' as const,
    },
  };

  const config = typeConfig[type];

  return (
    <NoticeContext.Provider
      value={{
        showNotice,
        closeNotice,
        showSuccess,
        showWarning,
        showError,
        showInfo,
      }}
    >
      {children}

      {/* Modern Notice Modal Dialog */}
      {isOpen && currentNotice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0F172A]/75 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/30 overflow-hidden transform transition-all animate-scale-up">
            {/* Top decorative banner */}
            <div className="pt-6 pb-2 px-6 flex flex-col items-center text-center">
              <div
                className={`w-16 h-16 rounded-2xl border ${config.badgeBg} ${config.ringColor} ring-8 flex items-center justify-center mb-4 shadow-sm`}
              >
                <Icon name={config.icon} className={`text-[36px] ${config.iconColor}`} />
              </div>

              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-2">
                {currentNotice.title}
              </h3>
              <p className="text-body-md text-on-surface-variant leading-relaxed">
                {currentNotice.message}
              </p>
            </div>

            {/* Optional Details Box */}
            {currentNotice.details && currentNotice.details.length > 0 && (
              <div className="px-6 py-3">
                <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-2 text-label-md">
                  {currentNotice.details.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-[13px]"
                    >
                      <span className="text-on-surface-variant">{item.label}:</span>
                      <span
                        className={`font-semibold ${
                          item.isHighlight ? 'text-primary font-bold' : 'text-on-surface'
                        }`}
                      >
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="p-6 pt-3 flex items-center justify-end gap-3 bg-surface-container-lowest">
              {currentNotice.secondaryButtonText && (
                <Button
                  variant="outline"
                  onClick={handleSecondary}
                  className="flex-1 h-11"
                >
                  {currentNotice.secondaryButtonText}
                </Button>
              )}
              <Button
                variant={config.btnVariant}
                onClick={handlePrimary}
                className="flex-1 h-11 font-bold shadow-md"
              >
                {currentNotice.primaryButtonText || 'Đã hiểu & Tiếp tục'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </NoticeContext.Provider>
  );
};

export const useNotice = (): NoticeContextType => {
  const context = useContext(NoticeContext);
  if (!context) {
    throw new Error('useNotice must be used within a NoticeProvider');
  }
  return context;
};
