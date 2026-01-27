/**
 * Generate Obligations Schema (Zod)
 * Validation schema for bulk obligation generation dialog
 */

import { z } from 'zod';

// Month options for select (0-indexed to match JavaScript Date)
export const MONTH_OPTIONS: { value: number; label: string }[] = [
  { value: 0, label: 'January' },
  { value: 1, label: 'February' },
  { value: 2, label: 'March' },
  { value: 3, label: 'April' },
  { value: 4, label: 'May' },
  { value: 5, label: 'June' },
  { value: 6, label: 'July' },
  { value: 7, label: 'August' },
  { value: 8, label: 'September' },
  { value: 9, label: 'October' },
  { value: 10, label: 'November' },
  { value: 11, label: 'December' },
];

/**
 * Schema for generating bulk obligations
 * UI uses month/year selects, which convert to periodStart/periodEnd on submit
 */
export const generateObligationsSchema = z.object({
  periodMonth: z.coerce
    .number({ required_error: 'Month is required' })
    .min(0, 'Invalid month')
    .max(11, 'Invalid month'),
  periodYear: z.coerce
    .number({ required_error: 'Year is required' })
    .min(2020, 'Year must be 2020 or later')
    .max(2100, 'Year must be 2100 or earlier'),
  dueDate: z.string().min(1, 'Due date is required'),
  feeTemplateIds: z.array(z.string()).min(1, 'Select at least one fee template'),
});

export type GenerateObligationsFormData = z.infer<typeof generateObligationsSchema>;

/**
 * Get the current year and the next few years for the year dropdown
 */
export const getYearOptions = (): number[] => {
  const currentYear = new Date().getFullYear();
  // Return current year and next 2 years
  return [currentYear - 1, currentYear, currentYear + 1, currentYear + 2];
};

/**
 * Get default due date (15 days from now)
 */
export const getDefaultDueDate = (): string => {
  const date = new Date();
  date.setDate(date.getDate() + 15);
  return date.toISOString().split('T')[0];
};

/**
 * Get current month (0-indexed)
 */
export const getCurrentMonth = (): number => {
  return new Date().getMonth();
};

/**
 * Get current year
 */
export const getCurrentYear = (): number => {
  return new Date().getFullYear();
};

/**
 * Calculate period start and end dates from month/year
 * @param month 0-indexed month
 * @param year Full year
 * @returns Object with periodStart and periodEnd as ISO date strings (YYYY-MM-DD)
 */
export const getPeriodDates = (
  month: number,
  year: number
): { periodStart: string; periodEnd: string } => {
  // First day of month
  const startDate = new Date(year, month, 1);
  // Last day of month (day 0 of next month = last day of current month)
  const endDate = new Date(year, month + 1, 0);

  return {
    periodStart: startDate.toISOString().split('T')[0],
    periodEnd: endDate.toISOString().split('T')[0],
  };
};

/**
 * Default form values
 */
export const getGenerateObligationsDefaults = (): GenerateObligationsFormData => ({
  periodMonth: getCurrentMonth(),
  periodYear: getCurrentYear(),
  dueDate: getDefaultDueDate(),
  feeTemplateIds: [],
});
