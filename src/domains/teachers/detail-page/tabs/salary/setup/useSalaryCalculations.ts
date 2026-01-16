import { useMemo } from 'react';
import { TAX_RATES, SALARY_SETUP_CONSTANTS } from '@/domains/teachers/schemas';

export interface ContributionBreakdown {
  pension: number;
  health: number;
  employment: number;
  injury: number;
  total: number;
}

export interface SalaryBreakdown {
  grossSalary: number;
  contributions: ContributionBreakdown;
  taxableIncome: number;
  incomeTax: number;
  netSalary: number;
}

/**
 * Calculate gross salary from desired net salary
 * Formula (North Macedonia 2025):
 *   Net = Gross × (1 - contributionRate) × (1 - taxRate)
 *   Net ≈ Gross × 0.648 (approximately 65%)
 *   Gross = Net / NET_TO_GROSS_MULTIPLIER
 */
export function calculateGrossFromNet(netSalary: number): number {
  if (netSalary <= 0) return 0;
  return Math.round((netSalary / SALARY_SETUP_CONSTANTS.NET_TO_GROSS_MULTIPLIER) * 100) / 100;
}

/**
 * Calculate net salary from gross salary
 * Formula (North Macedonia 2025):
 *   Contributions = Gross × 28% (≈27.5% standard)
 *   TaxableIncome = Gross - Contributions
 *   Tax = TaxableIncome × 10%
 *   Net = Gross - Contributions - Tax ≈ 65% of Gross
 */
export function calculateNetFromGross(grossSalary: number): number {
  if (grossSalary <= 0) return 0;
  return Math.round(grossSalary * SALARY_SETUP_CONSTANTS.NET_TO_GROSS_MULTIPLIER * 100) / 100;
}

/**
 * Calculate full salary breakdown from gross salary
 * Formula (North Macedonia 2025):
 *   Contributions = Gross × 28%
 *   TaxableIncome = Gross - Contributions
 *   Tax = TaxableIncome × 10%
 *   Net = Gross - Contributions - Tax
 */
export function calculateBreakdown(grossSalary: number): SalaryBreakdown {
  if (grossSalary <= 0) {
    return {
      grossSalary: 0,
      contributions: { pension: 0, health: 0, employment: 0, injury: 0, total: 0 },
      taxableIncome: 0,
      incomeTax: 0,
      netSalary: 0,
    };
  }

  // Calculate individual contributions
  const contributions: ContributionBreakdown = {
    pension: Math.round(grossSalary * TAX_RATES.PENSION * 100) / 100,
    health: Math.round(grossSalary * TAX_RATES.HEALTH * 100) / 100,
    employment: Math.round(grossSalary * TAX_RATES.EMPLOYMENT * 100) / 100,
    injury: Math.round(grossSalary * TAX_RATES.INJURY * 100) / 100,
    total: 0,
  };
  contributions.total = Math.round((contributions.pension + contributions.health + contributions.employment + contributions.injury) * 100) / 100;

  // Calculate taxable income (gross - contributions)
  const taxableIncome = Math.round((grossSalary - contributions.total) * 100) / 100;

  // Calculate income tax (10% of taxable income)
  const incomeTax = Math.round(taxableIncome * TAX_RATES.INCOME_TAX * 100) / 100;

  // Calculate net salary
  const netSalary = Math.round((grossSalary - contributions.total - incomeTax) * 100) / 100;

  return {
    grossSalary: Math.round(grossSalary * 100) / 100,
    contributions,
    taxableIncome,
    incomeTax,
    netSalary,
  };
}

interface UseSalaryCalculationsProps {
  inputValue: string;
  isDirectGrossEntry: boolean;
}

/**
 * Hook to calculate salary breakdown based on input mode
 */
export function useSalaryCalculations({ inputValue, isDirectGrossEntry }: UseSalaryCalculationsProps) {
  const breakdown = useMemo(() => {
    const numValue = parseFloat(inputValue);
    if (isNaN(numValue) || numValue <= 0) {
      return null;
    }

    if (isDirectGrossEntry) {
      // User entered gross salary directly
      return calculateBreakdown(numValue);
    } else {
      // User entered desired net - calculate gross first
      const calculatedGross = calculateGrossFromNet(numValue);
      return calculateBreakdown(calculatedGross);
    }
  }, [inputValue, isDirectGrossEntry]);

  return breakdown;
}
