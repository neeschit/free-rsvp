import type { InputHTMLAttributes } from 'react';

export type BaseFormProps = {
  label: string;
  id: string;
  error?: string;
  helperText?: string;
  required?: boolean;
};

export type BaseFormInputProps = BaseFormProps & InputHTMLAttributes<HTMLInputElement>; 