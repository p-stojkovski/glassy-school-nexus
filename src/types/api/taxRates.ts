// Tax Rates API Types

export interface TaxRateResponse {
  id: string;
  code: string;
  name: string;
  nameMk: string;
  rate: number;
  isContribution: boolean;
  displayOrder: number;
  isActive: boolean;
}

export interface TaxRatesResponse {
  contributions: TaxRateResponse[];
  taxes: TaxRateResponse[];
  totalContributionRate: number;
  totalTaxRate: number;
}

export interface UpdateTaxRateRequest {
  rate?: number;
  name?: string;
  nameMk?: string;
  isActive?: boolean;
}

// API paths
export const TaxRatesApiPaths = {
  TAX_RATES: '/api/settings/tax-rates',
  TAX_RATE_BY_ID: (id: string) => `/api/settings/tax-rates/${id}`,
} as const;

// Known tax rate codes
export const TAX_RATE_CODES = {
  PENSION: 'pension',
  HEALTH: 'health',
  EMPLOYMENT: 'employment',
  INJURY: 'injury',
  INCOME_TAX: 'income_tax',
} as const;
