import {
  parsePhoneNumber,
  isValidPhoneNumber,
  getCountryCallingCode,
  type CountryCode,
} from 'libphonenumber-js';

export interface SupportedCountry {
  code: CountryCode;
  name: string;
  dialCode: string;
  flag: string;
}

export const SUPPORTED_COUNTRIES: SupportedCountry[] = [
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪' },
  { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺' },
];

export interface PhoneNormalizationResult {
  isValid: boolean;
  e164: string;
  nationalNumber: string;
  country: CountryCode;
  error?: string;
}

/**
 * Normalizes phone numbers strictly in accordance with AGENTS.md Rule 7:
 * - Validated with libphonenumber-js
 * - Stored as E.164 (e.g. +919876543210)
 * - Country code is never typed twice (strips duplicate country calling code)
 * - Leading 0 is dropped
 */
export function normalizePhoneNumber(
  rawInput: string,
  defaultCountry: CountryCode = 'IN'
): PhoneNormalizationResult {
  if (!rawInput || typeof rawInput !== 'string' || !rawInput.trim()) {
    return {
      isValid: false,
      e164: '',
      nationalNumber: '',
      country: defaultCountry,
      error: 'Phone number is required',
    };
  }

  const callingCode = getCountryCallingCode(defaultCountry);
  
  // Extract all digits
  let digits = rawInput.replace(/\D/g, '');

  // Strip duplicate or redundant country calling code
  // E.g. user typed 91 in input while country is already +91 -> 919876543210 -> 9876543210
  while (digits.startsWith(callingCode) && digits.length > 10) {
    digits = digits.slice(callingCode.length);
  }

  // Drop leading zeroes (e.g. 09876543210 -> 9876543210)
  digits = digits.replace(/^0+/, '');

  if (!digits) {
    return {
      isValid: false,
      e164: '',
      nationalNumber: '',
      country: defaultCountry,
      error: 'Please enter a valid phone number',
    };
  }

  const fullNumber = `+${callingCode}${digits}`;

  try {
    const parsed = parsePhoneNumber(fullNumber, defaultCountry);
    const valid = parsed.isValid();

    return {
      isValid: valid,
      e164: parsed.number,
      nationalNumber: parsed.nationalNumber,
      country: (parsed.country as CountryCode) || defaultCountry,
      error: valid ? undefined : 'Invalid phone number format for selected country',
    };
  } catch {
    return {
      isValid: false,
      e164: '',
      nationalNumber: digits,
      country: defaultCountry,
      error: 'Invalid phone format',
    };
  }
}

/**
 * Validates whether an E.164 string is valid
 */
export function isValidE164Phone(phone: string, defaultCountry: CountryCode = 'IN'): boolean {
  if (!phone) return false;
  return normalizePhoneNumber(phone, defaultCountry).isValid;
}
