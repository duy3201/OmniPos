import React from 'react';
import { KeycapBadge } from './KeycapBadge';
import { Icon } from './Icon';

export type ButtonVariant =
  | 'primary'      // Xanh dương chủ đạo (#004ac6 / #2563eb)
  | 'secondary'    // Trắng viền xám / Đen chữ trắng
  | 'success'      // Xanh lá thanh toán (#006c49)
  | 'destructive'  // Đỏ hủy / xóa
  | 'outline'      // Viền mảnh
  | 'ghost';       // Trong suốt

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: string;
  iconRight?: string;
  shortcut?: string;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  icon,
  iconRight,
  shortcut,
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'relative inline-flex items-center justify-center font-headline-sm select-none transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none rounded-lg';

  const sizeStyles = {
    sm: 'h-8 px-2.5 text-label-sm gap-1.5',
    md: 'h-10 px-3.5 text-label-md gap-2',
    lg: 'h-11 px-4 text-headline-sm gap-2',
    xl: 'h-12 px-5 text-headline-sm gap-2.5 rounded-xl',
  };

  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      'bg-primary hover:bg-primary/90 text-on-primary shadow-sm hover:shadow',
    secondary:
      'bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/30',
    success:
      'bg-secondary hover:bg-on-secondary-container text-on-secondary shadow-lg shadow-secondary/20',
    destructive:
      'bg-error-container hover:bg-error text-on-error-container hover:text-on-error border border-error/20',
    outline:
      'bg-transparent hover:bg-surface-container text-on-surface border border-outline-variant/60',
    ghost:
      'bg-transparent hover:bg-surface-container text-on-surface-variant hover:text-on-surface',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Icon name="progress_activity" className="animate-spin text-[18px]" />
      ) : icon ? (
        <Icon name={icon} className="text-[18px]" />
      ) : null}

      {children && <span>{children}</span>}

      {iconRight && !loading && <Icon name={iconRight} className="text-[18px]" />}

      {shortcut && (
        <KeycapBadge
          label={shortcut}
          variant={variant === 'primary' || variant === 'success' ? 'dark' : 'light'}
          className="ml-0.5"
        />
      )}
    </button>
  );
};
