import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'teal';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm shadow-emerald-600/20 active:scale-95';
      case 'teal':
        return 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 active:scale-95';
      case 'secondary':
        return 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/80 active:scale-95';
      case 'outline':
        return 'border border-slate-200/80 hover:border-slate-300 text-slate-700 hover:text-slate-900 bg-white active:scale-95 shadow-2xs';
      case 'ghost':
        return 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:scale-95';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2.5 py-1.5 rounded-lg gap-1.5';
      case 'md':
        return 'text-xs font-semibold px-4 py-2.5 rounded-xl gap-2';
      case 'lg':
        return 'text-sm font-bold px-5 py-3 rounded-xl gap-2.5';
    }
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center transition-all disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 ${getVariantStyles()} ${getSizeStyles()} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
