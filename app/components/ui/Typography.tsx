import type { ReactNode, ElementType, HTMLAttributes, LabelHTMLAttributes } from 'react';
import * as patterns from '~/styles/tailwind-patterns';

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
type Variant = 'primary' | 'secondary' | 'muted';

type HeadingProps = {
  level: HeadingLevel;
  children: ReactNode;
  className?: string;
  variant?: Variant;
} & HTMLAttributes<HTMLHeadingElement>;

type TextProps = {
  children: ReactNode;
  className?: string;
  variant?: Variant;
  as?: 'p' | 'span' | 'div' | 'label';
} & HTMLAttributes<HTMLElement>;

export function Heading({ level, children, className = '', variant = 'primary', ...props }: HeadingProps) {
  const Tag = `h${level}` as ElementType;
  
  const defaultSizes = {
    1: 'text-3xl font-bold',
    2: 'text-2xl font-semibold',
    3: 'text-xl font-semibold',
    4: 'text-lg font-medium',
    5: 'text-base font-medium',
    6: 'text-sm font-medium',
  };

  const colorStyles = {
    primary: patterns.textPrimary,
    secondary: patterns.textSecondary,
    muted: patterns.textMuted,
  };

  return (
    <Tag className={`${defaultSizes[level]} ${colorStyles[variant]} ${className}`} {...props}>
      {children}
    </Tag>
  );
}

export function Text({ children, className = '', variant = 'primary', as = 'p', ...props }: TextProps) {
  const Tag = as as ElementType;
  
  const colorStyles = {
    primary: patterns.textPrimary,
    secondary: patterns.textSecondary,
    muted: patterns.textMuted,
  };

  return (
    <Tag className={`${colorStyles[variant]} ${className}`} {...props}>
      {children}
    </Tag>
  );
}

type LabelProps = {
  children: ReactNode;
  className?: string;
  variant?: Variant;
} & LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ children, className = '', variant = 'secondary', ...props }: LabelProps) {
  const colorStyles = {
    primary: patterns.textPrimary,
    secondary: patterns.textSecondary,
    muted: patterns.textMuted,
  };

  return (
    <label 
      className={`block text-sm font-medium mb-1 ${colorStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </label>
  );
}

type ErrorTextProps = Omit<TextProps, 'variant' | 'as'>;

export function ErrorText({ children, className = '', ...props }: ErrorTextProps) {
  return (
    <Text
      as="p"
      className={`text-sm text-red-600 dark:text-red-400 mt-1 ${className}`}
      {...props}
    >
      {children}
    </Text>
  );
}

type HelperTextProps = Omit<TextProps, 'variant' | 'as'>;

export function HelperText({ children, className = '', ...props }: HelperTextProps) {
  return (
    <Text
      as="p"
      variant="muted"
      className={`text-sm mt-1 ${className}`}
      {...props}
    >
      {children}
    </Text>
  );
} 