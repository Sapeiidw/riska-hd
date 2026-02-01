import { NextResponse } from "next/server";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export function successResponse<T>(
  data: T,
  meta?: ApiResponse["meta"],
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      meta,
    },
    { status }
  );
}

export function errorResponse(
  code: string,
  message: string,
  status = 400,
  details?: unknown
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
    },
    { status }
  );
}

export function unauthorizedResponse(
  message = "Unauthorized"
): NextResponse<ApiResponse> {
  return errorResponse("UNAUTHORIZED", message, 401);
}

export function forbiddenResponse(
  message = "Forbidden"
): NextResponse<ApiResponse> {
  return errorResponse("FORBIDDEN", message, 403);
}

export function notFoundResponse(
  message = "Not found"
): NextResponse<ApiResponse> {
  return errorResponse("NOT_FOUND", message, 404);
}

export function validationErrorResponse(
  details: unknown
): NextResponse<ApiResponse> {
  return errorResponse("VALIDATION_ERROR", "Validation failed", 400, details);
}

export function serverErrorResponse(
  message = "Internal server error"
): NextResponse<ApiResponse> {
  return errorResponse("SERVER_ERROR", message, 500);
}
