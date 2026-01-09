import { NextResponse } from 'next/server';

// Error codes enum
export enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  INVALID_TOKEN = 'INVALID_TOKEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  FORBIDDEN = 'FORBIDDEN',
  BAD_REQUEST = 'BAD_REQUEST',
}

// Function to create standardized error response
export function createErrorResponse(
  code: ErrorCode,
  message: string,
  details: any[] = [],
  status: number = 500
) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        details,
      },
    },
    { status }
  );
}

// Function to create success response (optional, for consistency)
export function createSuccessResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status });
}

// Higher-order function to wrap API handlers with global error handling
export function withErrorHandler(
  handler: (request: Request, context?: any) => Promise<Response>
) {
  return async (request: Request, context?: any) => {
    try {
      return await handler(request, context);
    } catch (error) {
      console.error('API Error:', error);
      return createErrorResponse(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'An unexpected error occurred',
        [],
        500
      );
    }
  };
}