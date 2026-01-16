/**
 * Teachers domain validation schemas barrel export
 * Phase 7 - Schema Consolidation
 */

// Salary-related schemas and types
export {
  // Constants
  TAX_RATES,
  SALARY_SETUP_CONSTANTS,
  // Salary setup
  salarySetupSchema,
  type SalarySetupFormData,
  // Change base salary
  changeBaseSalarySchema,
  type ChangeBaseSalaryFormData,
  // Generate salary
  generateSalarySchema,
  type GenerateSalaryFormData,
  // Approve salary
  approveSalarySchema,
  type ApproveSalaryFormData,
  // Reopen salary
  reopenSalarySchema,
  type ReopenSalaryFormData,
  // Adjustments
  addAdjustmentSchema,
  type AddAdjustmentFormData,
} from './salarySchemas';

// Employment-related schemas and types
export {
  // Utilities
  getDefaultEffectiveDate,
  // Employment settings
  employmentSettingsSchema,
  type EmploymentSettingsFormData,
} from './employmentSchemas';
