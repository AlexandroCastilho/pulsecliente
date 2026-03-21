import { sanitizeErrorMessage } from '@/lib/error-handler'

export type ServiceError = {
  message: string;
  code: 'UNAUTHORIZED' | 'NOT_FOUND' | 'VALIDATION_ERROR' | 'INTERNAL_ERROR' | 'FORBIDDEN' | 'CONFLICT';
  details?: any;
};

export type ServiceResponse<T = any> = 
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
export function errorResponse(message: string, code: ServiceError['code'] = 'INTERNAL_ERROR', details?: any): ServiceResponse {
  return {
    success: false,
    error: { message: sanitizeErrorMessage(message), code, details }
  };
}
