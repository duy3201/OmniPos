import React from 'react';

export type BadgeVariant =
  | 'success'       // Xanh lá (Khả dụng / Đã đồng bộ)
  | 'warning'       // Vàng cam (Sắp hết hàng / Cận date)
  | 'danger'        // Đỏ (Hết hàng / Hết hạn)
  | 'primary'       // Xanh dương (Mặc định / Thông tin)
  | 'neutral'       // Xám (Chờ xử lý / Đóng ca)
  | 'secondary';    // Xanh ngọc

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  dot = false,
  className = '',
  size = 'md',
}) => {
  const styles: Record<BadgeVariant, { bg: string; dotColor: string }> = {
    success: {
      bg: 'bg-secondary-container/40 text-on-secondary-container border border-secondary/20',
      dotColor: 'bg-secondary',
    },
    warning: {
      bg: 'bg-tertiary-fixed text-on-tertiary-container border border-tertiary/20',
      dotColor: 'bg-tertiary',
    },
    danger: {
      bg: 'bg-error-container text-on-error-container border border-error/20',
      dotColor: 'bg-error',
    },
    primary: {
      bg: 'bg-primary-fixed text-on-primary-fixed-variant border border-primary/20',
      dotColor: 'bg-primary',
    },
    secondary: {
      bg: 'bg-secondary-fixed/50 text-on-secondary-fixed border border-secondary-fixed-dim/40',
      dotColor: 'bg-secondary-fixed-dim',
    },
    neutral: {
      bg: 'bg-surface-container text-outline border border-outline-variant/30',
      dotColor: 'bg-outline',
    },
  };

  const sizeStyles = {
    sm: 'px-1.5 py-0.5 text-[11px]',
    md: 'px-2 py-0.5 text-label-sm',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-label-sm font-medium ${styles[variant].bg} ${sizeStyles[size]} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${styles[variant].dotColor}`}
        />
      )}
      {children}
    </span>
  );
};
