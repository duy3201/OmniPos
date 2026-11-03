import React from 'react';

interface KeycapBadgeProps {
  label: string;
  variant?: 'dark' | 'light' | 'primary';
  className?: string;
}

export const KeycapBadge: React.FC<KeycapBadgeProps> = ({
  label,
  variant = 'light',
  className = '',
}) => {
  const variantStyles = {
    dark: 'bg-black/30 text-white/70 border border-white/10',
    light: 'bg-surface-container text-outline border border-outline-variant/40',
    primary: 'bg-primary-container/20 text-primary border border-primary/20',
  };

  return (
    <span
      className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[11px] font-mono font-medium leading-none tracking-wider uppercase select-none ${variantStyles[variant]} ${className}`}
    >
      {label}
    </span>
  );
};
