/* eslint-disable @typescript-eslint/no-explicit-any */
import apiService from './api';
import {
  AuditLogResponse,
  GetAuditLogsResponse,
  GetAuditStatsResponse,
  GetAuditLogsParams,
  GetAuditStatsParams,
  AuditApiPaths,
  AuditHttpStatus,
} from '@/types/api/audit';

// Preserve status/details when rethrowing with a custom message
function makeApiError(original: any, message: string): Error & { status?: number; details?: any } {
  const err: any = new Error(message);
  if (original) {
    err.status = original.status;
    err.details = original.details;
  }
  return err as Error & { status?: number; details?: any };
}

export class AuditApiService {
  /**
   * Get audit logs with filtering and pagination
   * @param params - Query parameters for filtering and pagination
   * @returns Promise resolving to paginated audit logs
   */
  async getAuditLogs(params?: GetAuditLogsParams): Promise<GetAuditLogsResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (params) {
        if (params.action) queryParams.append('action', params.action);
        if (params.resourceType) queryParams.append('resourceType', params.resourceType);
        if (params.resourceId) queryParams.append('resourceId', params.resourceId);
        if (params.userId) queryParams.append('userId', params.userId);
        if (params.status) queryParams.append('status', params.status);
        if (params.startDate) queryParams.append('startDate', params.startDate);
        if (params.endDate) queryParams.append('endDate', params.endDate);
        if (params.pageNumber) queryParams.append('pageNumber', params.pageNumber.toString());
        if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      }

      const url = `${AuditApiPaths.LOGS_BASE}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      return await apiService.get<GetAuditLogsResponse>(url);
    } catch (error: any) {
      if (error.status === AuditHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'No audit logs found');
      }
      if (error.status === AuditHttpStatus.BAD_REQUEST) {
        const details = error.details;
        if (details?.detail?.includes('date')) {
          throw makeApiError(error, 'Invalid date range provided');
        }
        if (details?.detail?.includes('page')) {
          throw makeApiError(error, 'Invalid pagination parameters');
        }
        throw makeApiError(error, `Validation error: ${details?.detail || 'Invalid query parameters'}`);
      }
      if (error.status === AuditHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to access audit logs');
      }
      if (error.status === AuditHttpStatus.FORBIDDEN) {
        throw makeApiError(error, 'You do not have permission to access audit logs');
      }
      throw makeApiError(error, `Failed to fetch audit logs: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get specific audit log by ID
   * @param id - The audit log ID
   * @returns Promise resolving to the audit log entry
   */
  async getAuditLog(id: string): Promise<AuditLogResponse> {
    try {
      return await apiService.get<AuditLogResponse>(AuditApiPaths.LOGS_BY_ID(id));
    } catch (error: any) {
      if (error.status === AuditHttpStatus.NOT_FOUND) {
        throw makeApiError(error, 'Audit log entry not found');
      }
      if (error.status === AuditHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to access audit logs');
      }
      if (error.status === AuditHttpStatus.FORBIDDEN) {
        throw makeApiError(error, 'You do not have permission to access this audit log');
      }
      throw makeApiError(error, `Failed to fetch audit log: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get audit statistics for a date range
   * @param params - Date range and optional filters
   * @returns Promise resolving to audit statistics
   */
  async getAuditStatistics(params: GetAuditStatsParams): Promise<GetAuditStatsResponse> {
    try {
      const queryParams = new URLSearchParams();

      queryParams.append('startDate', params.startDate);
      queryParams.append('endDate', params.endDate);
      if (params.action) queryParams.append('action', params.action);
      if (params.resourceType) queryParams.append('resourceType', params.resourceType);

      const url = `${AuditApiPaths.STATS}?${queryParams.toString()}`;
      return await apiService.get<GetAuditStatsResponse>(url);
    } catch (error: any) {
      if (error.status === AuditHttpStatus.BAD_REQUEST) {
        const details = error.details;
        if (details?.detail?.includes('date')) {
          throw makeApiError(error, 'Invalid date range provided for statistics');
        }
        throw makeApiError(error, `Validation error: ${details?.detail || 'Invalid parameters'}`);
      }
      if (error.status === AuditHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to access audit statistics');
      }
      if (error.status === AuditHttpStatus.FORBIDDEN) {
        throw makeApiError(error, 'You do not have permission to access audit statistics');
      }
      throw makeApiError(error, `Failed to fetch audit statistics: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Export audit logs to file
   * @param params - Query parameters for filtering
   * @param format - Export format (csv, json, xlsx)
   * @returns Promise resolving to exported file blob
   */
  async exportAuditLogs(params?: GetAuditLogsParams, format: 'csv' | 'json' | 'xlsx' = 'csv'): Promise<Blob> {
    try {
      const queryParams = new URLSearchParams();

      queryParams.append('format', format);
      if (params) {
        if (params.action) queryParams.append('action', params.action);
        if (params.resourceType) queryParams.append('resourceType', params.resourceType);
        if (params.resourceId) queryParams.append('resourceId', params.resourceId);
        if (params.userId) queryParams.append('userId', params.userId);
        if (params.status) queryParams.append('status', params.status);
        if (params.startDate) queryParams.append('startDate', params.startDate);
        if (params.endDate) queryParams.append('endDate', params.endDate);
      }

      const url = `${AuditApiPaths.LOGS_EXPORT}?${queryParams.toString()}`;
      return await apiService.get<Blob>(url);
    } catch (error: any) {
      if (error.status === AuditHttpStatus.BAD_REQUEST) {
        throw makeApiError(error, 'Invalid export parameters');
      }
      if (error.status === AuditHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required to export audit logs');
      }
      if (error.status === AuditHttpStatus.FORBIDDEN) {
        throw makeApiError(error, 'You do not have permission to export audit logs');
      }
      throw makeApiError(error, `Failed to export audit logs: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Cleanup old audit logs (admin only)
   * @param olderThanDays - Delete logs older than this many days
   * @returns Promise resolving to deletion count
   */
  async cleanupOldAuditLogs(olderThanDays: number): Promise<{ deletedCount: number }> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('olderThanDays', olderThanDays.toString());

      const url = `${AuditApiPaths.CLEANUP}?${queryParams.toString()}`;
      return await apiService.delete<{ deletedCount: number }>(url);
    } catch (error: any) {
      if (error.status === AuditHttpStatus.BAD_REQUEST) {
        throw makeApiError(error, 'Invalid cleanup parameters');
      }
      if (error.status === AuditHttpStatus.UNAUTHORIZED) {
        throw makeApiError(error, 'Authentication required for audit cleanup');
      }
      if (error.status === AuditHttpStatus.FORBIDDEN) {
        throw makeApiError(error, 'You do not have permission to cleanup audit logs (admin only)');
      }
      throw makeApiError(error, `Failed to cleanup audit logs: ${error.message || 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export const auditApiService = new AuditApiService();

// Convenience exports matching project style
export const getAuditLogs = (params?: GetAuditLogsParams) => auditApiService.getAuditLogs(params);

export const getAuditLog = (id: string) => auditApiService.getAuditLog(id);

export const getAuditStatistics = (params: GetAuditStatsParams) => auditApiService.getAuditStatistics(params);

export const exportAuditLogs = (params?: GetAuditLogsParams, format?: 'csv' | 'json' | 'xlsx') =>
  auditApiService.exportAuditLogs(params, format);

export const cleanupOldAuditLogs = (olderThanDays: number) => auditApiService.cleanupOldAuditLogs(olderThanDays);

// Export default
export default auditApiService;
