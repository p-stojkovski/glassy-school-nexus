/**
 * Student Schemas
 *
 * Central export for all student validation schemas and utilities.
 */

export {
	createStudentSchema,
	updateStudentSchema,
	personalInfoSchema,
	guardianInfoSchema,
	financialInfoSchema,
	validateStudentForm,
	validateStudentFirstName,
	validateStudentLastName,
	validateStudentEmail,
	validateStudentPhone,
	validateDiscountTypeId,
	isStudentFormValid,
	sanitizeStudentData,
	createStudentRequest,
	createUpdateStudentRequest,
	validateAndPrepareStudentData,
	StudentErrorHandlers,
} from './studentValidators';

export type {
	CreateStudentFormData,
	UpdateStudentFormData,
	PersonalInfoFormData,
	GuardianInfoFormData,
	FinancialInfoFormData,
	StudentFormErrors,
	ValidationResult,
} from './studentValidators';
