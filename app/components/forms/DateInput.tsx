import React, { useState, useEffect, useRef } from 'react';
import * as patterns from '~/styles/tailwind-patterns';
import { Label, ErrorText, HelperText } from '~/components/ui/Typography';
import type { InputHTMLAttributes } from 'react';
import type { BaseFormProps } from './types';

type DateInputProps = BaseFormProps & {
  value?: string;
  onChange?: (isoDate: string) => void;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'>;

export function DateInput({
  label,
  id,
  error,
  helperText,
  required = false,
  placeholder = 'MM/DD/YY',
  className = '',
  value = '',
  onChange,
  ...props
}: DateInputProps) {
  const inputClasses = error
    ? `${patterns.input} border-red-500 dark:border-red-500 focus:ring-red-500 dark:focus:ring-red-400`
    : patterns.input;

  // State for both ISO format (YYYY-MM-DD) and display format (MM/DD/YY)
  const [isoDate, setIsoDate] = useState(value);
  const [displayDate, setDisplayDate] = useState('');
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  // Function to convert ISO format to MM/DD/YY display format
  const formatToDisplayDate = (isoString: string) => {
    if (!isoString) return '';
    try {
      const [year, month, day] = isoString.split('-');
      return `${month}/${day}/${year.slice(2)}`;
    } catch (e) {
      return '';
    }
  };

  // Parse MM/DD/YY format to ISO format
  const parseDisplayToIso = (displayValue: string) => {
    const match = displayValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/);
    if (match) {
      const [_, month, day, year] = match;
      const fullYear = `20${year}`;
      const paddedMonth = month.padStart(2, '0');
      const paddedDay = day.padStart(2, '0');
      return `${fullYear}-${paddedMonth}-${paddedDay}`;
    }
    return '';
  };

  // Effect to sync internal state with the controlled value prop
  useEffect(() => {
    setIsoDate(value);
  }, [value]);

  // Initialize the display value from the ISO date
  useEffect(() => {
    if (isoDate) {
      setDisplayDate(formatToDisplayDate(isoDate));
    }
  }, [isoDate]);

  // Handle display value changes
  const handleDisplayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDisplayDate(value);
    
    // Try to parse to ISO format
    const newIsoDate = parseDisplayToIso(value);
    if (newIsoDate) {
      setIsoDate(newIsoDate);
      onChange?.(newIsoDate);
    }
  };

  // Open native date picker
  const openDatePicker = () => {
    if (hiddenInputRef.current) {
      hiddenInputRef.current.showPicker();
    }
  };

  // Handle changes from the hidden native date picker
  const handleNativeDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newIsoDate = e.target.value;
    setIsoDate(newIsoDate);
    setDisplayDate(formatToDisplayDate(newIsoDate));
    onChange?.(newIsoDate);
  };

  return (
    <div className="space-y-1">
      {label && (
        <Label htmlFor={id}>
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      <div className="relative">
        <input
          type="text"
          id={id}
          required={required}
          placeholder={placeholder}
          className={`${inputClasses} ${className}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-description` : undefined}
          value={displayDate}
          onChange={handleDisplayChange}
          {...props}
        />
        
        {/* Hidden native date input for the calendar picker */}
        <input
          ref={hiddenInputRef}
          name={id}
          type="date"
          className="sr-only"
          value={isoDate}
          onChange={handleNativeDateChange}
          tabIndex={-1}
          aria-hidden="true"
        />
        
        {/* Calendar button */}
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          onClick={openDatePicker}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span className="sr-only">Open calendar</span>
        </button>
      </div>
      
      {error && (
        <ErrorText id={`${id}-error`}>{error}</ErrorText>
      )}
      {helperText && !error && (
        <HelperText id={`${id}-description`}>{helperText}</HelperText>
      )}
    </div>
  );
} 