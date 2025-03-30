import type { HTMLAttributes, ReactNode } from 'react';
import * as patterns from '~/styles/tailwind-patterns';

type StatusType = 'success' | 'warning' | 'error' | 'info' | 'default';

type StatusBadgeProps = {
  type?: StatusType;
  children: ReactNode;
  className?: string;
} & HTMLAttributes<HTMLSpanElement>;

export function StatusBadge({ 
  type = 'default', 
  children, 
  className = '',
  ...props 
}: StatusBadgeProps) {
  const statusStyles = {
    success: patterns.statusSuccess,
    warning: patterns.statusWarning,
    error: patterns.statusError,
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  };

  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${statusStyles[type]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

export function RsvpBadge({ 
  status,
  children, 
  className = '',
  ...props 
}: { status: 'Going' | 'Maybe' | 'Not Going', children: ReactNode } & Omit<StatusBadgeProps, 'type' | 'children'>) {
  const typeMapping = {
    'Going': 'success' as const,
    'Maybe': 'warning' as const,
    'Not Going': 'error' as const
  };

  return (
    <StatusBadge type={typeMapping[status]} className={className} {...props}>
      {children}
    </StatusBadge>
  );
} 