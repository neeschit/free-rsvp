import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router';
import * as patterns from '~/styles/tailwind-patterns';

type ButtonVariant = 'primary' | 'secondary' | 'outline';

type ButtonBaseProps = {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  children: ReactNode;
  className?: string;
};

type ButtonAsButtonProps = ButtonBaseProps & 
  ButtonHTMLAttributes<HTMLButtonElement> & {
    as?: 'button';
  };

type ButtonAsLinkProps = ButtonBaseProps & {
  as: 'a';
  href: string;
  onClick?: () => void;
};

type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

export function Button({ 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  children,
  as,
  ...props 
}: ButtonProps) {
  const baseStyles = "py-2 px-4 rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors";
  
  const variantStyles = {
    primary: patterns.buttonPrimary,
    secondary: patterns.buttonSecondary,
    outline: patterns.buttonOutline
  };

  const widthClass = fullWidth ? "w-full" : "";
  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${widthClass} ${className}`;
  
  if (as === 'a') {
    const { href, ...restProps } = props as ButtonAsLinkProps;
    return (
      <Link
        to={href}
        className={combinedClassName}
        {...restProps}
      >
        {children}
      </Link>
    );
  }
  
  return (
    <button
      className={combinedClassName}
      {...(props as ButtonAsButtonProps)}
    >
      {children}
    </button>
  );
} 