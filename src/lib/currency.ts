/**
 * Currency utilities adhering to HireRoom rules:
 * "Show INR first on Indian listings."
 */

const INDIAN_CITIES_OR_TERMS = [
  'india',
  'bengaluru',
  'bangalore',
  'mumbai',
  'hyderabad',
  'pune',
  'delhi',
  'ncr',
  'gurugram',
  'gurgaon',
  'noida',
  'chennai',
  'kolkata',
  'ahmedabad',
  'kochi',
  'chandigarh',
  'jaipur',
];

/**
 * Checks if a listing location or text belongs to an Indian context
 */
export function isIndianListing(location?: string): boolean {
  if (!location) return false;
  const lower = location.toLowerCase();
  return INDIAN_CITIES_OR_TERMS.some(term => lower.includes(term));
}

/**
 * Formats a pay/compensation string according to platform rules:
 * - Indian listings show INR (₹) first.
 * - Non-Indian listings preserve USD ($) or specified currency.
 */
export function formatCompensation(pay: string, location?: string): string {
  if (!pay) return '';

  const isIndia = isIndianListing(location);

  // If it's already an INR string, return cleanly formatted
  if (pay.includes('₹') || pay.toUpperCase().includes('INR') || pay.includes('LPA') || pay.includes('L/yr')) {
    return pay;
  }

  // If listing is located in India, ensure INR is primary
  if (isIndia) {
    // If pay was specified in USD ($250, $1000 etc), provide INR conversion or INR label
    if (pay.startsWith('$')) {
      const numericVal = parseFloat(pay.replace(/[^0-9.]/g, ''));
      if (!isNaN(numericVal)) {
        // Approx standard conversion: 1 USD ~ 85 INR
        const inrEquivalent = Math.round(numericVal * 85);
        const formattedInr = inrEquivalent.toLocaleString('en-IN');
        return `₹${formattedInr} (${pay})`;
      }
    }
    // Default fallback to INR
    return pay.replace(/^\$/, '₹');
  }

  return pay;
}
