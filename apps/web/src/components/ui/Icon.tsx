import React from 'react';

interface IconProps {
  name: string;
  className?: string;
  fill?: boolean;
  size?: number | string;
}

export const Icon: React.FC<IconProps> = ({ name, className = '', fill = false, size }) => {
  const style: React.CSSProperties = {
    ...(size ? { fontSize: typeof size === 'number' ? `${size}px` : size } : {}),
    ...(fill ? { fontVariationSettings: "'FILL' 1" } : {}),
  };

  return (
    <span
      className={`material-symbols-outlined select-none inline-flex items-center justify-center leading-none ${className}`}
      style={style}
    >
      {name}
    </span>
  );
};
