import type { InputHTMLAttributes } from 'react';
import * as patterns from '~/styles/tailwind-patterns';
import { Label, ErrorText, HelperText } from '~/components/ui/Typography';

type FormInputProps = {
  label: string;
  id: string;
  error?: string;
  helperText?: string;
  required?: boolean;
} & InputHTMLAttributes<HTMLInputElement>;

export function FormInput({
  label,
  id,
  error,
  helperText,
  required = false,
  className = '',
  ...props
}: FormInputProps) {
  const inputClasses = error
    ? `${patterns.input} border-red-500 dark:border-red-500 focus:ring-red-500 dark:focus:ring-red-400`
    : patterns.input;

  return (
    <div className="space-y-1">
      <Label htmlFor={id}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <input
        id={id}
        name={id}
        required={required}
        className={`${inputClasses} ${className}`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${id}-error` : helperText ? `${id}-description` : undefined}
        {...props}
      />
      {error && (
        <ErrorText id={`${id}-error`}>{error}</ErrorText>
      )}
      {helperText && !error && (
        <HelperText id={`${id}-description`}>{helperText}</HelperText>
      )}
    </div>
  );
} 