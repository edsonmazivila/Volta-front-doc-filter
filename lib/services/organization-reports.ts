/**
 * Organization-wide consolidated reports service
 * Endpoints: /api/reports/organization/*
 * Scope: All companies within the organization
 */

import { getAuthCookieHeader } from '@/lib/http/request.server';
import { API_BASE_URL } from '@/lib/config';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Generic API request helper for organization reports
 */
async function apiRequest<T>(endpoint: string): Promise<T> {
  const headers = await getAuthCookieHeader();
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'GET',
    headers,
    credentials: 'include',
    cache: 'no-store'
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Request failed');
  }

  const json = await response.json() as ApiResponse<T>;
  return json.data;
}

/**
 * Consolidated Payroll Report
 * Returns aggregated payroll data across all companies in the organization
 */
export interface ConsolidatedPayrollReport {
  period: string;
  total_companies: number;
  total_employees: number;
  total_gross_pay: number;
  total_net_pay: number;
  total_deductions: number;
  total_taxes: number;
  by_company: {
    company_id: string;
    company_name: string;
    employees_count: number;
    gross_pay: number;
    net_pay: number;
    deductions: number;
    taxes: number;
  }[];
}

export async function getConsolidatedPayrollReport(
  period?: string
): Promise<ConsolidatedPayrollReport> {
  const params = new URLSearchParams();
  if (period) params.append('period', period);
  
  return apiRequest(`/api/reports/organization/payroll?${params.toString()}`);
}

/**
 * Consolidated Employees Report
 * Returns aggregated employee metrics across all companies
 */
export interface ConsolidatedEmployeesReport {
  total_employees: number;
  active_employees: number;
  inactive_employees: number;
  total_companies: number;
  by_company: {
    company_id: string;
    company_name: string;
    total_employees: number;
    active_employees: number;
    inactive_employees: number;
    departments_count: number;
  }[];
  by_department: {
    department_name: string;
    company_name: string;
    employees_count: number;
  }[];
  employment_distribution: {
    full_time: number;
    part_time: number;
    contractor: number;
  };
}

export async function getConsolidatedEmployeesReport(): Promise<ConsolidatedEmployeesReport> {
  return apiRequest('/api/reports/organization/employees');
}

/**
 * Consolidated Leave Report
 * Returns aggregated leave data across all companies
 */
export interface ConsolidatedLeaveReport {
  total_requests: number;
  pending_requests: number;
  approved_requests: number;
  rejected_requests: number;
  total_days_taken: number;
  by_company: {
    company_id: string;
    company_name: string;
    total_requests: number;
    pending_requests: number;
    approved_requests: number;
    total_days: number;
  }[];
  by_type: {
    leave_type: string;
    requests_count: number;
    total_days: number;
  }[];
  upcoming_leaves: {
    employee_name: string;
    company_name: string;
    leave_type: string;
    start_date: string;
    end_date: string;
    days: number;
  }[];
}

export async function getConsolidatedLeaveReport(
  startDate?: string,
  endDate?: string
): Promise<ConsolidatedLeaveReport> {
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  
  return apiRequest(`/api/reports/organization/leave?${params.toString()}`);
}

/**
 * Organization Stats Dashboard
 * Quick stats for Organization Dashboard
 */
export interface OrganizationDashboardStats {
  active_leave_requests: number;
  pending_timesheets: number;
  next_payroll_date?: string;
  total_employees: number;
  active_employees: number;
  total_companies: number;
  total_departments: number;
  total_payroll_mtd: number;
}

export async function getOrganizationStats(): Promise<OrganizationDashboardStats> {
  return apiRequest('/api/reports/organization/stats');
}

/**
 * Attendance Overview
 * Consolidated attendance across all companies
 */
export interface ConsolidatedAttendanceReport {
  total_entries: number;
  present_today: number;
  absent_today: number;
  late_today: number;
  by_company: {
    company_id: string;
    company_name: string;
    present: number;
    absent: number;
    late: number;
  }[];
}

export async function getConsolidatedAttendanceReport(
  date?: string
): Promise<ConsolidatedAttendanceReport> {
  const params = new URLSearchParams();
  if (date) params.append('date', date);
  
  return apiRequest(`/api/reports/organization/attendance?${params.toString()}`);
}
