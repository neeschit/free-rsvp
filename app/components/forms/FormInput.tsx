import type { InputHTMLAttributes } from 'react';
import * as patterns from '~/styles/tailwind-patterns';
import { Label, ErrorText, HelperText } from '~/components/ui/Typography';
import type { BaseFormInputProps } from './types';

export function FormInput({
  label,
  id,
  error,
  helperText,
  required = false,
  placeholder,
  className = '',
  ...props
}: BaseFormInputProps) {
  const inputClasses = error
    ? `${patterns.input} border-red-500 dark:border-red-500 focus:ring-red-500 dark:focus:ring-red-400`
    : patterns.input;

  // If required and no label is provided, append * to placeholder
  const displayPlaceholder = !label && required && placeholder 
    ? `${placeholder} *` 
    : placeholder;

  return (
    <div className="space-y-1">
      {label && (
        <Label htmlFor={id}>
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      <input
        id={id}
        name={id}
        required={required}
        placeholder={displayPlaceholder}
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