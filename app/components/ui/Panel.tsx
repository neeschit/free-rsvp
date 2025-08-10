import type { HTMLAttributes, ReactNode } from 'react';
import * as patterns from '~/styles/tailwind-patterns';

type PanelProps = {
  title?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'normal' | 'large';
} & HTMLAttributes<HTMLDivElement>;

export function Panel({ title, actions, children, className = '', padding = 'normal', ...props }: PanelProps) {
  const paddingClass = {
    none: '',
    normal: 'p-6',
    large: 'p-8',
  }[padding];

  return (
    <div className={`${patterns.bgCard} ${className}`.trim()} {...props}>
      {(title || actions) && (
        <div className={`p-6 ${patterns.borderBottom}`}>
          <div className="flex items-center justify-between gap-3">
            {title && <h3 className={`text-lg font-semibold ${patterns.textPrimary}`}>{title}</h3>}
            {actions && <div className="shrink-0">{actions}</div>}
          </div>
        </div>
      )}
      <div className={paddingClass}>{children}</div>
    </div>
  );
}


