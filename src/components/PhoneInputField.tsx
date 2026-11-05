'use client';

import React, { useState, useEffect } from 'react';
import { type CountryCode } from 'libphonenumber-js';
import {
  SUPPORTED_COUNTRIES,
  normalizePhoneNumber,
  type PhoneNormalizationResult,
} from '@/lib/phone';

interface PhoneInputFieldProps {
  id?: string;
  name?: string;
  value: string; // Stored E.164 (or national) value
  onChange: (e164Value: string, nationalValue: string) => void;
  onBlur?: () => void;
  error?: string;
  defaultCountry?: CountryCode;
  className?: string;
  required?: boolean;
}

export function PhoneInputField({
  id = 'phone-input',
  name = 'phone',
  value,
  onChange,
  onBlur,
  error,
  defaultCountry = 'IN',
  className = '',
  required = false,
}: PhoneInputFieldProps) {
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(defaultCountry);
  const [localInput, setLocalInput] = useState('');

  // Synchronize initial value from E.164 to local display
  useEffect(() => {
    if (value) {
      const normalized = normalizePhoneNumber(value, selectedCountry);
      if (normalized.nationalNumber) {
        setLocalInput(normalized.nationalNumber);
      }
    }
  }, [value, selectedCountry]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextCountry = e.target.value as CountryCode;
    setSelectedCountry(nextCountry);
    const normalized = normalizePhoneNumber(localInput, nextCountry);
    onChange(normalized.isValid ? normalized.e164 : normalized.nationalNumber, normalized.nationalNumber);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const normalized = normalizePhoneNumber(rawValue, selectedCountry);
    setLocalInput(normalized.nationalNumber);
    // Always store clean E.164 when valid or normalized phone representation
    onChange(normalized.isValid ? normalized.e164 : (normalized.nationalNumber ? `+91${normalized.nationalNumber}` : ''), normalized.nationalNumber);
  };

  const currentCountry =
    SUPPORTED_COUNTRIES.find(c => c.code === selectedCountry) || SUPPORTED_COUNTRIES[0];

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex rounded-xl border border-ink-border bg-surface shadow-xs transition-colors focus-within:border-ink focus-within:ring-1 focus-within:ring-ink">
        {/* Country Selector Dropdown */}
        <div className="relative flex items-center border-r border-ink-border bg-surface-subtle/50 px-2.5 rounded-l-xl">
          <span className="text-base mr-1">{currentCountry.flag}</span>
          <select
            value={selectedCountry}
            onChange={handleCountryChange}
            aria-label="Select country code"
            className="appearance-none bg-transparent pr-4 pl-0 py-2.5 text-xs font-semibold text-ink focus:outline-none cursor-pointer"
          >
            {SUPPORTED_COUNTRIES.map(c => (
              <option key={c.code} value={c.code}>
                {c.dialCode} ({c.code})
              </option>
            ))}
          </select>
        </div>

        {/* National Number Input */}
        <input
          type="tel"
          id={id}
          name={name}
          value={localInput}
          onChange={handleInputChange}
          onBlur={onBlur}
          required={required}
          placeholder="98765 43210"
          className="flex-1 bg-transparent px-3.5 py-2.5 text-sm font-medium text-ink placeholder:text-ink-faint focus:outline-none"
        />
      </div>

      {/* Inline Validation / Help Message */}
      {error ? (
        <p className="text-xs font-medium text-rose-600 animate-fadeIn" role="alert">
          {error}
        </p>
      ) : (
        <p className="text-[11px] text-ink-muted">
          Validated via libphonenumber-js & stored in E.164 format. Leading zero is dropped.
        </p>
      )}
    </div>
  );
}
