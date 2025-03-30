import type { ReactNode } from 'react';
import * as patterns from '~/styles/tailwind-patterns';
import { Heading } from './Typography';

type CardProps = {
  children: ReactNode;
  className?: string;
  title?: string;
  padding?: 'none' | 'normal' | 'large';
};

export function Card({ 
  children, 
  className = '', 
  title,
  padding = 'normal'
}: CardProps) {
  const paddingClass = {
    none: '',
    normal: 'p-6',
    large: 'p-8'
  }[padding];

  return (
    <div className={`${patterns.bgCard} ${className}`}>
      {title && (
        <div className={`p-6 ${patterns.borderBottom}`}>
          <Heading level={3}>{title}</Heading>
        </div>
      )}
      <div className={paddingClass}>
        {children}
      </div>
    </div>
  );
} 