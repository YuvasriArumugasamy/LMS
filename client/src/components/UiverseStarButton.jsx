import React from 'react';
import { Clock } from 'lucide-react';

export const UiverseStarButton = ({
  children,
  onClick,
  disabled,
  variant = 'checkin', // 'checkin' | 'checkout' | 'emerald'
  icon: Icon = Clock,
  className = ''
}) => {
  const variantClass = variant === 'checkout' ? 'btn-checkout' : variant === 'emerald' ? 'btn-emerald' : 'btn-checkin';

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`uiverse-star-btn ${variantClass} ${className}`}
    >
      {Icon && <Icon className="w-4 h-4 text-current shrink-0 fill-current" />}
      <span>{children}</span>
    </button>
  );
};
