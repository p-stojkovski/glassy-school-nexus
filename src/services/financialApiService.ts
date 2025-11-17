/* eslint-disable @typescript-eslint/no-explicit-any */
import apiService from './api';
import {
  PaymentObligation,
  PaymentRecord,
  StudentFinancialSummary,
  ClassFinancialSummary,
  FinancialDashboardData,
  DiscountDefinition,
  CreatePaymentObligationRequest,
  UpdatePaymentObligationRequest,
  CreatePaymentObligationResponse,
  CreatePaymentRecordRequest,
  UpdatePaymentRecordRequest,
  CreatePaymentRecordResponse,
  CreateDiscountRequest,
  UpdateDiscountRequest,
  CreateDiscountResponse,
  BatchCreateObligationRequest,
  BatchCreateObligationResponse,
  FinancialReportParams,
  FinancialApiPaths,
  FinancialHttpStatus,
} from '@/types/api/financial';

// Preserve status/details when rethrowing with a custom message
function makeApiError(original: any, message: string): Error & { status?: number; details?: any } {
  const err: any = new Error(message);
  if (original) {
    err.status = original.status;
    err.details = original.details;
  }
  return err as Error & { status?: number; details?: any };
}

export class FinancialApiService {
  // ========================================================================
  // PAYMENT OBLIGATION METHODS
  // ========================================================================

  /**
   * Create a new payment obligation for a student
   */
  async createPaymentObligation(request: CreatePaymentObligationRequest): Promise<CreatePaymentObligationResponse> {
    try {
      return await apiService.post<CreatePaymentObligationResponse>(FinancialApiPaths.OBLIGATIONS_BASE, request);
    } catch (error: any) {
      if (error.status === FinancialHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Student not found');
      }
      if (error.status === FinancialHttpStatus.BAD_REQUEST) {
        const details = error.details;
        if (details?.detail?.includes('amount')) {
          throw makeApiError(error, 'Invalid obligation amount');
        }
        if (details?.detail?.includes('due date')) {
          throw makeApiError(error, 'Due date cannot be in the past');
        }
        throw makeApiError(error, `Validation error: ${details?.detail || 'Invalid obligation data'}`);
      }
      if (error.status === FinancialHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to create obligations');
      }
      throw makeApiError(error, `Failed to create obligation: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get all payment obligations for a student
   */
  async getStudentObligations(studentId: string): Promise<PaymentObligation[]> {
    try {
      return await apiService.get<PaymentObligation[]>(FinancialApiPaths.OBLIGATIONS_BY_STUDENT(studentId));
    } catch (error: any) {
      if (error.status === FinancialHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Student not found or has no obligations');
      }
      if (error.status === FinancialHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to view obligations');
      }
      throw makeApiError(error, `Failed to fetch obligations: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get specific payment obligation by ID
   */
  async getPaymentObligation(id: string): Promise<PaymentObligation> {
    try {
      return await apiService.get<PaymentObligation>(FinancialApiPaths.OBLIGATIONS_BY_ID(id));
    } catch (error: any) {
      if (error.status === FinancialHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Payment obligation not found');
      }
      if (error.status === FinancialHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to view obligation');
      }
      throw makeApiError(error, `Failed to fetch obligation: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Update a payment obligation
   */
  async updatePaymentObligation(id: string, request: UpdatePaymentObligationRequest): Promise<PaymentObligation> {
    try {
      return await apiService.put<PaymentObligation>(FinancialApiPaths.OBLIGATIONS_BY_ID(id), request);
    } catch (error: any) {
      if (error.status === FinancialHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Payment obligation not found');
      }
      if (error.status === FinancialHttpStatus.BAD_REQUEST) {
        const details = error.details;
        if (details?.detail?.includes('amount')) {
          throw makeApiError(error, 'Invalid obligation amount');
        }
        throw makeApiError(error, `Validation error: ${details?.detail || 'Invalid obligation data'}`);
      }
      if (error.status === FinancialHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to update obligation');
      }
      throw makeApiError(error, `Failed to update obligation: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Delete a payment obligation
   */
  async deletePaymentObligation(id: string): Promise<void> {
    try {
      await apiService.delete<void>(FinancialApiPaths.OBLIGATIONS_BY_ID(id));
    } catch (error: any) {
      if (error.status === FinancialHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Payment obligation not found');
      }
      if (error.status === FinancialHttpStatus.CONFLICT) {
        throw makeApiError(error, 'Cannot delete obligation with existing payments');
      }
      if (error.status === FinancialHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to delete obligation');
      }
      throw makeApiError(error, `Failed to delete obligation: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Create obligations for multiple students in batch
   */
  async batchCreateObligations(request: BatchCreateObligationRequest): Promise<BatchCreateObligationResponse> {
    try {
      return await apiService.post<BatchCreateObligationResponse>(FinancialApiPaths.OBLIGATIONS_BATCH_CREATE, request);
    } catch (error: any) {
      if (error.status === FinancialHttpStatus.BAD_REQUEST) {
        throw makeApiError(error, 'Invalid batch obligation request');
      }
      if (error.status === FinancialHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to create obligations');
      }
      throw makeApiError(error, `Failed to create batch obligations: ${error.message || 'Unknown error'}`);
    }
  }

  // ========================================================================
  // PAYMENT METHODS
  // ========================================================================

  /**
   * Record a payment against an obligation
   */
  async recordPayment(request: CreatePaymentRecordRequest): Promise<CreatePaymentRecordResponse> {
    try {
      return await apiService.post<CreatePaymentRecordResponse>(FinancialApiPaths.PAYMENTS_BASE, request);
    } catch (error: any) {
      if (error.status === FinancialHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Obligation not found');
      }
      if (error.status === FinancialHttpStatus.BAD_REQUEST) {
        const details = error.details;
        if (details?.detail?.includes('amount')) {
          throw makeApiError(error, 'Payment amount exceeds obligation remaining balance');
        }
        throw makeApiError(error, `Validation error: ${details?.detail || 'Invalid payment data'}`);
      }
      if (error.status === FinancialHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to record payments');
      }
      throw makeApiError(error, `Failed to record payment: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get payment history for a student
   */
  async getStudentPaymentHistory(studentId: string): Promise<PaymentRecord[]> {
    try {
      return await apiService.get<PaymentRecord[]>(FinancialApiPaths.PAYMENTS_BY_STUDENT(studentId));
    } catch (error: any) {
      if (error.status === FinancialHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Student not found or has no payment history');
      }
      if (error.status === FinancialHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to view payment history');
      }
      throw makeApiError(error, `Failed to fetch payment history: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get payments for a specific obligation
   */
  async getObligationPayments(obligationId: string): Promise<PaymentRecord[]> {
    try {
      return await apiService.get<PaymentRecord[]>(FinancialApiPaths.PAYMENTS_BY_OBLIGATION(obligationId));
    } catch (error: any) {
      if (error.status === FinancialHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Obligation not found or has no payments');
      }
      if (error.status === FinancialHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to view payments');
      }
      throw makeApiError(error, `Failed to fetch obligation payments: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get specific payment record
   */
  async getPaymentRecord(id: string): Promise<PaymentRecord> {
    try {
      return await apiService.get<PaymentRecord>(FinancialApiPaths.PAYMENTS_BY_ID(id));
    } catch (error: any) {
      if (error.status === FinancialHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Payment record not found');
      }
      if (error.status === FinancialHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to view payment');
      }
      throw makeApiError(error, `Failed to fetch payment record: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Update a payment record
   */
  async updatePaymentRecord(id: string, request: UpdatePaymentRecordRequest): Promise<PaymentRecord> {
    try {
      return await apiService.put<PaymentRecord>(FinancialApiPaths.PAYMENTS_BY_ID(id), request);
    } catch (error: any) {
      if (error.status === FinancialHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Payment record not found');
      }
      if (error.status === FinancialHttpStatus.BAD_REQUEST) {
        throw makeApiError(error, 'Invalid payment update data');
      }
      if (error.status === FinancialHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to update payment');
      }
      throw makeApiError(error, `Failed to update payment: ${error.message || 'Unknown error'}`);
    }
  }

  // ========================================================================
  // FINANCIAL SUMMARY METHODS
  // ========================================================================

  /**
   * Get financial summary for a student
   */
  async getStudentFinancialSummary(studentId: string): Promise<StudentFinancialSummary> {
    try {
      return await apiService.get<StudentFinancialSummary>(FinancialApiPaths.SUMMARY_STUDENT(studentId));
    } catch (error: any) {
      if (error.status === FinancialHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Student not found');
      }
      if (error.status === FinancialHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to view financial summary');
      }
      throw makeApiError(error, `Failed to fetch financial summary: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get financial summary for a class
   */
  async getClassFinancialSummary(classId: string): Promise<ClassFinancialSummary> {
    try {
      return await apiService.get<ClassFinancialSummary>(FinancialApiPaths.SUMMARY_CLASS(classId));
    } catch (error: any) {
      if (error.status === FinancialHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Class not found');
      }
      if (error.status === FinancialHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to view financial summary');
      }
      throw makeApiError(error, `Failed to fetch class financial summary: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get financial dashboard data
   */
  async getFinancialDashboard(): Promise<FinancialDashboardData> {
    try {
      return await apiService.get<FinancialDashboardData>(FinancialApiPaths.SUMMARY_DASHBOARD);
    } catch (error: any) {
      if (error.status === FinancialHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to view dashboard');
      }
      throw makeApiError(error, `Failed to fetch financial dashboard: ${error.message || 'Unknown error'}`);
    }
  }

  // ========================================================================
  // DISCOUNT METHODS
  // ========================================================================

  /**
   * Create a new discount
   */
  async createDiscount(request: CreateDiscountRequest): Promise<CreateDiscountResponse> {
    try {
      return await apiService.post<CreateDiscountResponse>(FinancialApiPaths.DISCOUNTS_BASE, request);
    } catch (error: any) {
      if (error.status === FinancialHttpStatus.BAD_REQUEST) {
        const details = error.details;
        if (details?.detail?.includes('name')) {
          throw makeApiError(error, 'Discount name already exists');
        }
        throw makeApiError(error, `Validation error: ${details?.detail || 'Invalid discount data'}`);
      }
      if (error.status === FinancialHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to create discounts');
      }
      throw makeApiError(error, `Failed to create discount: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get all discounts
   */
  async getDiscounts(): Promise<DiscountDefinition[]> {
    try {
      return await apiService.get<DiscountDefinition[]>(FinancialApiPaths.DISCOUNTS_BASE);
    } catch (error: any) {
      if (error.status === FinancialHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to view discounts');
      }
      throw makeApiError(error, `Failed to fetch discounts: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get specific discount
   */
  async getDiscount(id: string): Promise<DiscountDefinition> {
    try {
      return await apiService.get<DiscountDefinition>(FinancialApiPaths.DISCOUNTS_BY_ID(id));
    } catch (error: any) {
      if (error.status === FinancialHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Discount not found');
      }
      if (error.status === FinancialHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to view discount');
      }
      throw makeApiError(error, `Failed to fetch discount: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Update a discount
   */
  async updateDiscount(id: string, request: UpdateDiscountRequest): Promise<DiscountDefinition> {
    try {
      return await apiService.put<DiscountDefinition>(FinancialApiPaths.DISCOUNTS_BY_ID(id), request);
    } catch (error: any) {
      if (error.status === FinancialHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Discount not found');
      }
      if (error.status === FinancialHttpStatus.BAD_REQUEST) {
        throw makeApiError(error, 'Invalid discount update data');
      }
      if (error.status === FinancialHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to update discount');
      }
      throw makeApiError(error, `Failed to update discount: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Delete a discount
   */
  async deleteDiscount(id: string): Promise<void> {
    try {
      await apiService.delete<void>(FinancialApiPaths.DISCOUNTS_BY_ID(id));
    } catch (error: any) {
      if (error.status === FinancialHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Discount not found');
      }
      if (error.status === FinancialHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to delete discount');
      }
      throw makeApiError(error, `Failed to delete discount: ${error.message || 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export const financialApiService = new FinancialApiService();

// Convenience exports - Payment Obligations
export const createPaymentObligation = (request: CreatePaymentObligationRequest) =>
  financialApiService.createPaymentObligation(request);

export const getStudentObligations = (studentId: string) =>
  financialApiService.getStudentObligations(studentId);

export const getPaymentObligation = (id: string) =>
  financialApiService.getPaymentObligation(id);

export const updatePaymentObligation = (id: string, request: UpdatePaymentObligationRequest) =>
  financialApiService.updatePaymentObligation(id, request);

export const deletePaymentObligation = (id: string) =>
  financialApiService.deletePaymentObligation(id);

export const batchCreateObligations = (request: BatchCreateObligationRequest) =>
  financialApiService.batchCreateObligations(request);

// Convenience exports - Payments
export const recordPayment = (request: CreatePaymentRecordRequest) =>
  financialApiService.recordPayment(request);

export const getStudentPaymentHistory = (studentId: string) =>
  financialApiService.getStudentPaymentHistory(studentId);

export const getObligationPayments = (obligationId: string) =>
  financialApiService.getObligationPayments(obligationId);

export const getPaymentRecord = (id: string) =>
  financialApiService.getPaymentRecord(id);

export const updatePaymentRecord = (id: string, request: UpdatePaymentRecordRequest) =>
  financialApiService.updatePaymentRecord(id, request);

// Convenience exports - Financial Summary
export const getStudentFinancialSummary = (studentId: string) =>
  financialApiService.getStudentFinancialSummary(studentId);

export const getClassFinancialSummary = (classId: string) =>
  financialApiService.getClassFinancialSummary(classId);

export const getFinancialDashboard = () =>
  financialApiService.getFinancialDashboard();

// Convenience exports - Discounts
export const createDiscount = (request: CreateDiscountRequest) =>
  financialApiService.createDiscount(request);

export const getDiscounts = () =>
  financialApiService.getDiscounts();

export const getDiscount = (id: string) =>
  financialApiService.getDiscount(id);

export const updateDiscount = (id: string, request: UpdateDiscountRequest) =>
  financialApiService.updateDiscount(id, request);

export const deleteDiscount = (id: string) =>
  financialApiService.deleteDiscount(id);

// Export default
export default financialApiService;
