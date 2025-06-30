// src/utils/errorHandler.ts
// Sistema centralizado de tratamento de erros

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorDetails {
  code: string;
  message: string;
  context?: Record<string, unknown>;
  timestamp: Date;
  severity: ErrorSeverity;
}

export class AppError extends Error {
  code: string;
  context?: Record<string, unknown>;
  severity: ErrorSeverity;

  constructor(
    message: string, 
    code = 'UNKNOWN_ERROR', 
    severity: ErrorSeverity = 'medium',
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.severity = severity;
    this.context = context;
  }
}

export class ErrorHandler {
  private static errorLog: ErrorDetails[] = [];
  private static maxLogSize = 100;

  static logError(error: Error | AppError, context?: Record<string, unknown>): void {
    const errorDetails: ErrorDetails = {
      code: error instanceof AppError ? error.code : 'UNKNOWN_ERROR',
      message: error.message,
      context: error instanceof AppError ? error.context : context,
      timestamp: new Date(),
      severity: error instanceof AppError ? error.severity : 'medium'
    };

    this.errorLog.unshift(errorDetails);
    
    // Manter apenas os últimos erros
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize);
    }

    // Log no console baseado na severidade
    if (errorDetails.severity === 'critical') {
      console.error('🚨 CRITICAL ERROR:', errorDetails);
    } else if (errorDetails.severity === 'high') {
      console.error('❌ HIGH SEVERITY ERROR:', errorDetails);
    } else {
      console.warn('⚠️ Error logged:', errorDetails);
    }
  }

  static getErrorLog(): ErrorDetails[] {
    return [...this.errorLog];
  }

  static clearErrorLog(): void {
    this.errorLog = [];
  }

  static handleAsyncError(error: unknown, operation: string): void {
    if (error instanceof Error) {
      this.logError(new AppError(
        `Async operation failed: ${operation}`,
        'ASYNC_ERROR',
        'medium',
        { operation, originalError: error.message }
      ));
    } else {
      this.logError(new AppError(
        `Unknown async error in: ${operation}`,
        'ASYNC_UNKNOWN_ERROR',
        'medium',
        { operation, error: String(error) }
      ));
    }
  }
}

// Hook global para erros não tratados
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    ErrorHandler.handleAsyncError(event.reason, 'Unhandled Promise Rejection');
  });

  window.addEventListener('error', (event) => {
    ErrorHandler.logError(new AppError(
      event.message,
      'GLOBAL_ERROR',
      'high',
      { 
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno 
      }
    ));
  });
}