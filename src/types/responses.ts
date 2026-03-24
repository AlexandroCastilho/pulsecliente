import { sanitizeErrorMessage } from '@/lib/error-handler'

export type ServiceError = {
  message: string;
  code: 'UNAUTHORIZED' | 'NOT_FOUND' | 'VALIDATION_ERROR' | 'INTERNAL_ERROR' | 'FORBIDDEN' | 'CONFLICT';
  details?: unknown;
};

export type ServiceResponse<T = unknown> = 
  | { success: true; data: T }
  | { success: false; error: ServiceError };

/**
 * Utilitário para criar respostas de sucesso
 */
export function successResponse<T>(data: T): ServiceResponse<T> {
  return { success: true, data };
}

/**
 * Utilitário para criar respostas de erro
 */
export function errorResponse<T = unknown>(message: string, code: ServiceError['code'] = 'INTERNAL_ERROR', details?: unknown): ServiceResponse<T> {
  return {
    success: false,
    error: { message: sanitizeErrorMessage(message), code, details }
  };
}
