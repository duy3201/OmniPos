import React from 'react';

interface BentoCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const BentoCard: React.FC<BentoCardProps> = ({
  children,
  title,
  subtitle,
  action,
  className = '',
  onClick,
  hoverable = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative flex flex-col p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm transition-all duration-150 ${
        hoverable || onClick
          ? 'hover:shadow-md hover:border-primary/40 cursor-pointer active:scale-[0.995]'
          : ''
      } ${className}`}
    >
      {(title || action || subtitle) && (
        <div className="flex items-start justify-between gap-2 mb-3 pb-2 border-b border-outline-variant/20">
          <div>
            {title && (
              <h3 className="font-headline-sm text-label-md text-on-surface">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-body-sm text-outline mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className="flex-1">{children}</div>
    </div>
  );
};
