import type { HTMLAttributes, ReactNode, ElementType } from 'react';
import * as patterns from '~/styles/tailwind-patterns';

type SectionProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  /**
   * When true, apply the standard section padding from tailwind-patterns.
   * When false, only apply the container width constraint.
   */
  useSectionPadding?: boolean;
} & Omit<HTMLAttributes<HTMLElement>, 'children'>;

export function Section({
  as = 'section',
  children,
  className = '',
  useSectionPadding = false,
  ...props
}: SectionProps) {
  const Tag = as as ElementType;
  const baseClassName = useSectionPadding
    ? `${patterns.section} ${patterns.container}`
    : patterns.container;

  return (
    <Tag className={`${baseClassName} ${className}`.trim()} {...props}>
      {children}
    </Tag>
  );
}


