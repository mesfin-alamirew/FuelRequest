// src/lib/utils.ts
// utils/json-to-csv.ts
import { AllReportTypes } from '@/types/reports';

export function convertToCSV(data: AllReportTypes[]): string {
  if (!data || data.length === 0) {
    return '';
  }

  // Get headers from the first object, which is type-safe
  const headers = Object.keys(data[0]) as (keyof AllReportTypes)[];
  const headerLine = headers.map((header) => `"${header}"`).join(',');

  const bodyLines = data.map((row) =>
    headers
      .map((header) => {
        const value = row[header] ?? '';
        const escapedValue = String(value).replace(/"/g, '""');
        return `"${escapedValue}"`;
      })
      .join(',')
  );

  return [headerLine, ...bodyLines].join('\n');
}

/**
 * Formats a number as a currency string.
 * @param amount The number to format.
 * @param currency The currency code (e.g., 'USD', 'EUR', 'KSH').
 * @param locale The locale to use for formatting (e.g., 'en-US', 'de-DE', 'en-KE').
 * @returns The formatted currency string.
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'USD', // Default to USD, but can be changed based on your needs
  locale: string = 'en-US' // Default locale
): string => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  } catch (error) {
    console.error('Failed to format currency:', error);
    // Fallback in case of an error
    return `${amount} ${currency}`;
  }
};
