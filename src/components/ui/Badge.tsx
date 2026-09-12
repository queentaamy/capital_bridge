import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, ShieldCheck } from 'lucide-react';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  showDefaultIcon?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  children,
  icon: CustomIcon,
  showDefaultIcon = true,
  size = 'sm',
  className = '',
}) => {
  const getStyles = () => {
    switch (variant) {
      case 'success':
        return {
          container: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
          defaultIcon: CheckCircle2,
        };
      case 'warning':
        return {
          container: 'bg-amber-50 text-amber-700 border-amber-200/80',
          defaultIcon: AlertTriangle,
        };
      case 'danger':
        return {
          container: 'bg-rose-50 text-rose-700 border-rose-200/80',
          defaultIcon: AlertCircle,
        };
      case 'info':
        return {
          container: 'bg-teal-50 text-teal-700 border-teal-200/80',
          defaultIcon: Info,
        };
      default:
        return {
          container: 'bg-slate-100 text-slate-700 border-slate-200/80',
          defaultIcon: ShieldCheck,
        };
    }
  };

  const { container, defaultIcon: DefaultIcon } = getStyles();
  const IconComponent = CustomIcon || (showDefaultIcon ? DefaultIcon : null);
  const sizeClasses = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full border tracking-wide uppercase ${sizeClasses} ${container} ${className}`}
    >
      {IconComponent && <IconComponent className={size === 'sm' ? 'w-3 h-3 shrink-0' : 'w-3.5 h-3.5 shrink-0'} />}
      <span>{children}</span>
    </span>
  );
};
