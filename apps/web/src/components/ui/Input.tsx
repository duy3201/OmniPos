import React from 'react';
import { Icon } from './Icon';
import { KeycapBadge } from './KeycapBadge';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: string;
  shortcut?: string;
  error?: string;
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ icon, shortcut, error, label, className = '', ...props }, ref) => {
    return (
      <div className="w-full space-y-1">
        {label && (
          <label className="block text-label-sm font-label-sm text-outline">
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {icon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-surface-tint">
              <Icon name={icon} className="text-[20px]" />
            </div>
          )}
          <input
            ref={ref}
            className={`w-full h-11 rounded-lg bg-surface-container-lowest text-on-surface text-body-md placeholder:text-outline border border-outline-variant/40 focus:border-primary focus:outline-none focus:shadow-[0_0_0_2px_#004ac6,0_0_12px_rgba(0,74,198,0.18)] transition-all font-body-md ${
              icon ? 'pl-11' : 'pl-3.5'
            } ${shortcut ? 'pr-12' : 'pr-3.5'} ${
              error ? 'border-error focus:border-error focus:shadow-[0_0_0_2px_#ba1a1a]' : ''
            } ${className}`}
            {...props}
          />
          {shortcut && (
            <div className="absolute right-2.5 flex items-center pointer-events-none">
              <KeycapBadge label={shortcut} />
            </div>
          )}
        </div>
        {error && <p className="text-[11px] text-error mt-0.5">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
