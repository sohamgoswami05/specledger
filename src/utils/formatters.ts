/**
 * Formats a number as Indian Rupee (INR) currency string with standard comma separation
 * e.g. 24999 -> ₹24,999
 */
export function formatINR(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN');
}

/**
 * Validates a 6-digit Indian postal code
 */
export function isValidIndianPincode(pincode: string): boolean {
  return /^[1-9][0-9]{5}$/.test(pincode.trim());
}

/**
 * Returns region description based on Indian Pincode prefix
 */
export function getPincodeRegionDescription(pincode: string): {
  zone: string;
  isWestBengalOrEast: boolean;
} {
  const clean = pincode.trim();
  if (!clean || clean.length < 1) {
    return { zone: 'Unknown', isWestBengalOrEast: false };
  }
  const prefix = clean.charAt(0);
  switch (prefix) {
    case '7':
      return { zone: 'West Bengal & Eastern Region', isWestBengalOrEast: true };
    case '8':
      return { zone: 'Bihar & Jharkhand', isWestBengalOrEast: false };
    case '1':
      return { zone: 'Delhi, Haryana & Punjab', isWestBengalOrEast: false };
    case '2':
      return { zone: 'Uttar Pradesh & Uttarakhand', isWestBengalOrEast: false };
    case '3':
      return { zone: 'Gujarat & Rajasthan', isWestBengalOrEast: false };
    case '4':
      return { zone: 'Maharashtra & Goa', isWestBengalOrEast: false };
    case '5':
      return { zone: 'Andhra Pradesh & Telangana', isWestBengalOrEast: false };
    case '6':
      return { zone: 'Tamil Nadu & Kerala', isWestBengalOrEast: false };
    default:
      return { zone: 'Other Indian States', isWestBengalOrEast: false };
  }
}
