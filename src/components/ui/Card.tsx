import React from 'react';

interface CardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  variant?: 'glass' | 'surface' | 'dark';
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  badge,
  action,
  children,
  footer,
  className = '',
  variant = 'surface',
}) => {
  const getVariant = () => {
    switch (variant) {
      case 'glass':
        return 'bg-white/95 backdrop-blur-sm border-slate-200/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)]';
      case 'dark':
        return 'bg-slate-900 border-slate-800 text-white';
      default:
        return 'bg-white border-slate-200/70 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]';
    }
  };

  return (
    <div
      className={`border rounded-3xl p-5 sm:p-6 transition relative overflow-hidden text-slate-800 ${getVariant()} ${className}`}
    >
      {(title || action || badge) && (
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              {title && (
                <h3 className="font-bold text-slate-900 text-base tracking-tight">{title}</h3>
              )}
              {badge}
            </div>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      <div>{children}</div>

      {footer && (
        <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
          {footer}
        </div>
      )}
    </div>
  );
};
