/**
 * Payments API Service
 * Handles payment registration for student obligations
 */

import apiService from './api';
import type {
  CreatePaymentRequest,
  CreatePaymentResponse,
  ObligationPaymentsListResponse,
} from '@/types/api/obligations';
import { PaymentsApiPaths, ObligationsHttpStatus } from '@/types/api/obligations';

interface ApiError {
  message: string;
  status: number;
  details?: unknown;
}

function makeApiError(
  original: ApiError | undefined,
  message: string
): Error & { status?: number; details?: unknown } {
  const err: Error & { status?: number; details?: unknown } = new Error(message);
  if (original) {
    err.status = original.status;
    err.details = original.details;
  }
  return err;
}

export class PaymentsApiService {
  /**
   * Create a payment record for an obligation.
   * POST /api/obligations/:obligationId/payments
   */
  async createPayment(
    obligationId: string,
    request: CreatePaymentRequest
  ): Promise<CreatePaymentResponse> {
    try {
      const response = await apiService.post<CreatePaymentResponse>(
        PaymentsApiPaths.CREATE_PAYMENT(obligationId),
        request
      );
      return response;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      
      if (apiError.status === ObligationsHttpStatus.NOT_FOUND) {
        throw makeApiError(apiError, 'Obligation not found');
      }
      
      if (apiError.status === ObligationsHttpStatus.BAD_REQUEST) {
        // Check for specific validation errors from backend
        const detail = (apiError.details as { detail?: string })?.detail;
        if (detail?.includes('exceeds') || detail?.includes('remaining')) {
          throw makeApiError(apiError, 'Payment amount exceeds remaining balance');
        }
        if (detail?.includes('cancelled')) {
          throw makeApiError(apiError, 'Cannot add payment to cancelled obligation');
        }
        if (detail?.includes('paid')) {
          throw makeApiError(apiError, 'Obligation is already fully paid');
        }
        throw makeApiError(apiError, apiError.message || 'Invalid payment data');
      }
      
      if (apiError.status === ObligationsHttpStatus.UNAUTHORIZED) {
        throw makeApiError(apiError, 'Authentication required to create payment');
      }
      
      const errorMsg = apiError.message || 'Unknown error';
      throw makeApiError(apiError, 'Failed to create payment: ' + errorMsg);
    }
  }

  /**
   * Get all payments for an obligation.
   * GET /api/obligations/:obligationId/payments
   */
  async getObligationPayments(
    obligationId: string
  ): Promise<ObligationPaymentsListResponse> {
    try {
      const response = await apiService.get<ObligationPaymentsListResponse>(
        PaymentsApiPaths.GET_OBLIGATION_PAYMENTS(obligationId)
      );
      return response;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      
      if (apiError.status === ObligationsHttpStatus.NOT_FOUND) {
        throw makeApiError(apiError, 'Obligation not found');
      }
      
      if (apiError.status === ObligationsHttpStatus.UNAUTHORIZED) {
        throw makeApiError(apiError, 'Authentication required to view payments');
      }
      
      const errorMsg = apiError.message || 'Unknown error';
      throw makeApiError(apiError, 'Failed to fetch payments: ' + errorMsg);
    }
  }
}

// Export singleton instance
const paymentsApiService = new PaymentsApiService();
export default paymentsApiService;

// Convenience exports for direct function calls
export const createPayment = (
  obligationId: string,
  request: CreatePaymentRequest
) => paymentsApiService.createPayment(obligationId, request);

export const getObligationPayments = (obligationId: string) =>
  paymentsApiService.getObligationPayments(obligationId);
