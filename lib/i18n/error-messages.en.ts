/**
 * Error Messages - English
 * 
 * Maps backend error codes to user-friendly messages in English.
 * This file contains all API error codes that can be returned by the backend.
 */

export const errorMessagesEN = {
  // ============================================================================
  // AUTHENTICATION ERRORS
  // ============================================================================
  INVALID_CREDENTIALS: "Invalid email or password",
  SESSION_EXPIRED: "Your session has expired. Please log in again",
  TOKEN_EXPIRED: "Your authentication has expired",
  TOKEN_INVALID: "Invalid authentication token",
  INSUFFICIENT_PERMISSIONS: "You don't have permission for this action",
  MFA_REQUIRED: "Two-factor authentication is required",
  MFA_INVALID: "Invalid authentication code",
  UNAUTHORIZED: "Unauthorized access",
  
  // ============================================================================
  // ORGANIZATION ERRORS
  // ============================================================================
  ORGANIZATION_INACTIVE: "Your organization is inactive. Please contact support",
  ORGANIZATION_SUSPENDED: "Your organization has been suspended. Please contact support",
  ORGANIZATION_NOT_APPROVED: "Your registration is pending approval",
  ORGANIZATION_REJECTED: "Your registration was rejected. Please contact support",
  ORGANIZATION_NOT_FOUND: "Organization not found",
  
  // ============================================================================
  // USER ERRORS
  // ============================================================================
  USER_INACTIVE: "Your account has been deactivated",
  USER_NOT_FOUND: "User not found",
  USER_ALREADY_EXISTS: "User already exists",
  EMPLOYEE_RECORD_REQUIRED: "Employee record is required",
  EMAIL_ALREADY_IN_USE: "Email address is already in use",
  
  // ============================================================================
  // RESOURCE ERRORS
  // ============================================================================
  RESOURCE_NOT_FOUND: "Resource not found",
  DUPLICATE_RESOURCE: "This record already exists",
  RESOURCE_IN_USE: "This resource is currently in use and cannot be deleted",
  
  // ============================================================================
  // VALIDATION ERRORS
  // ============================================================================
  VALIDATION_ERROR: "Please check the fields below",
  INVALID_INPUT: "Invalid data",
  MISSING_PARAMETER: "Required field not filled",
  INVALID_FORMAT: "Invalid format",
  INVALID_DATE_RANGE: "Invalid date range",
  INVALID_EMAIL: "Invalid email address",
  INVALID_PHONE: "Invalid phone number",
  PASSWORD_TOO_WEAK: "Password is too weak",
  PASSWORDS_DO_NOT_MATCH: "Passwords do not match",
  
  // ============================================================================
  // FILE ERRORS
  // ============================================================================
  FILE_TOO_BIG: "File is too large",
  INVALID_FILE_TYPE: "File type not allowed",
  FILE_UPLOAD_FAILED: "Failed to upload file",
  FILE_NOT_FOUND: "File not found",
  FILE_PROCESSING_ERROR: "Error processing file",
  
  // ============================================================================
  // GENERAL HTTP ERRORS
  // ============================================================================
  INTERNAL_ERROR: "Internal error. Please try again",
  BAD_REQUEST: "Invalid request",
  FORBIDDEN: "Access denied",
  NOT_FOUND: "Not found",
  CONFLICT: "Data conflict",
  TOO_MANY_REQUESTS: "Too many requests. Please wait a moment",
  SERVICE_UNAVAILABLE: "Service temporarily unavailable",
  
  // ============================================================================
  // DATABASE ERRORS
  // ============================================================================
  DATABASE_ERROR: "Error accessing data",
  DATABASE_CONNECTION_ERROR: "Database connection error",
  QUERY_ERROR: "Error executing query",
  
  // ============================================================================
  // EXTERNAL SERVICES ERRORS
  // ============================================================================
  EMAIL_SEND_FAILED: "Failed to send email",
  SMS_SEND_FAILED: "Failed to send SMS",
  CAPTCHA_FAILED: "CAPTCHA verification failed",
  PAYMENT_FAILED: "Payment failed",
  
  // ============================================================================
  // PAYROLL SPECIFIC ERRORS
  // ============================================================================
  PAYROLL_ALREADY_PROCESSED: "Payroll has already been processed",
  PAYROLL_LOCKED: "Payroll is locked and cannot be modified",
  PAYROLL_PERIOD_INVALID: "Invalid payroll period",
  SALARY_CALCULATION_ERROR: "Error calculating salary",
  
  // ============================================================================
  // ATTENDANCE & TIMESHEET ERRORS
  // ============================================================================
  ATTENDANCE_ALREADY_RECORDED: "Attendance already recorded for this period",
  TIMESHEET_ALREADY_APPROVED: "Timesheet has already been approved",
  INVALID_CLOCK_IN_OUT: "Invalid clock in/out time",
  OVERLAPPING_SHIFTS: "Overlapping shifts detected",
  
  // ============================================================================
  // LEAVE ERRORS
  // ============================================================================
  LEAVE_BALANCE_INSUFFICIENT: "Insufficient leave balance",
  LEAVE_ALREADY_APPROVED: "Leave request has already been approved",
  OVERLAPPING_LEAVE: "Overlapping leave request exists",
  LEAVE_REQUEST_EXPIRED: "Leave request has expired",
  
  // ============================================================================
  // DEPARTMENT & EMPLOYEE ERRORS
  // ============================================================================
  DEPARTMENT_NOT_FOUND: "Department not found",
  DEPARTMENT_HAS_EMPLOYEES: "Department has employees and cannot be deleted",
  EMPLOYEE_NOT_FOUND: "Employee not found",
  EMPLOYEE_ALREADY_EXISTS: "Employee already exists",
  
  // ============================================================================
  // DOCUMENT ERRORS
  // ============================================================================
  DOCUMENT_NOT_FOUND: "Document not found",
  DOCUMENT_EXPIRED: "Document has expired",
  DOCUMENT_ALREADY_VERIFIED: "Document has already been verified",
  
  // ============================================================================
  // NETWORK & TIMEOUT ERRORS
  // ============================================================================
  NETWORK_ERROR: "Network error. Please check your connection",
  REQUEST_TIMEOUT: "Request timeout. Please try again",
  
  // ============================================================================
  // DEFAULT & FALLBACK
  // ============================================================================
  UNKNOWN_ERROR: "An error occurred. Please try again",
  DEFAULT: "An error occurred. Please try again",
} as const;

export type ErrorCode = keyof typeof errorMessagesEN;
