/**
 * Organization Data Services
 * Organization Admin: View consolidated data across all companies
 */

import { getAuthCookieHeader, fetchWithTimeout } from '@/lib/http/request.server';
import { API_BASE_URL } from '@/lib/config';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  message?: string;
}

// PAYROLLS
export interface OrganizationPayroll {
  id: string;
  company_id: string;
  company_name: string;
  pay_period_start: string;
  pay_period_end: string;
  pay_date?: string;
  status: 'draft' | 'processed' | 'paid';
  total_employees: number;
  gross_amount: number;
  net_amount: number;
  total_deductions: number;
  created_at: string;
}

export async function getOrganizationPayrolls(params?: {
  company_id?: string;
  status?: string;
}): Promise<{ data: OrganizationPayroll[]; count: number }> {
  const headers = await getAuthCookieHeader();
  const queryParams = new URLSearchParams();
  if (params?.company_id) queryParams.append('company_id', params.company_id);
  if (params?.status) queryParams.append('status', params.status);
  
  const url = `${API_BASE_URL}/api/organization/payrolls${queryParams.toString() ? `?${queryParams}` : ''}`;
  const response = await fetchWithTimeout(url, {
    method: 'GET',
    headers,
    credentials: 'include',
    cache: 'no-store'
  }, 10000);

  if (!response.ok) throw new Error('Failed to fetch payrolls');
  const json = await response.json() as ApiResponse<OrganizationPayroll[]>;
  return { data: json.data || [], count: json.count || 0 };
}

// TIMESHEETS
export interface OrganizationTimesheet {
  id: string;
  company_id: string;
  company_name: string;
  employee_id: string;
  employee_name: string;
  pay_period_start: string;
  pay_period_end: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  regular_hours: number;
  overtime_hours: number;
  total_hours: number;
}

export async function getOrganizationTimesheets(params?: {
  company_id?: string;
  status?: string;
}): Promise<{ data: OrganizationTimesheet[]; count: number }> {
  const headers = await getAuthCookieHeader();
  const queryParams = new URLSearchParams();
  if (params?.company_id) queryParams.append('company_id', params.company_id);
  if (params?.status) queryParams.append('status', params.status);
  
  const url = `${API_BASE_URL}/api/organization/timesheets${queryParams.toString() ? `?${queryParams}` : ''}`;
  const response = await fetchWithTimeout(url, {
    method: 'GET',
    headers,
    credentials: 'include',
    cache: 'no-store'
  }, 10000);

  if (!response.ok) throw new Error('Failed to fetch timesheets');
  const json = await response.json() as ApiResponse<OrganizationTimesheet[]>;
  return { data: json.data || [], count: json.count || 0 };
}

// LEAVES
export interface OrganizationLeave {
  id: string;
  company_id: string;
  company_name: string;
  employee_id: string;
  employee_name: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  total_days: number;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
}

export async function getOrganizationLeaves(params?: {
  company_id?: string;
  status?: string;
}): Promise<{ data: OrganizationLeave[]; count: number }> {
  const headers = await getAuthCookieHeader();
  const queryParams = new URLSearchParams();
  if (params?.company_id) queryParams.append('company_id', params.company_id);
  if (params?.status) queryParams.append('status', params.status);
  
  const url = `${API_BASE_URL}/api/organization/leaves${queryParams.toString() ? `?${queryParams}` : ''}`;
  const response = await fetchWithTimeout(url, {
    method: 'GET',
    headers,
    credentials: 'include',
    cache: 'no-store'
  }, 10000);

  if (!response.ok) throw new Error('Failed to fetch leaves');
  const json = await response.json() as ApiResponse<OrganizationLeave[]>;
  return { data: json.data || [], count: json.count || 0 };
}

// DEPARTMENTS
export interface OrganizationDepartment {
  id: string;
  company_id: string;
  company_name: string;
  name: string;
  code?: string;
  manager_name?: string;
  employees_count: number;
  is_active: boolean;
}

export async function getOrganizationDepartments(params?: {
  company_id?: string;
}): Promise<{ data: OrganizationDepartment[]; count: number }> {
  const headers = await getAuthCookieHeader();
  const queryParams = new URLSearchParams();
  if (params?.company_id) queryParams.append('company_id', params.company_id);
  
  const url = `${API_BASE_URL}/api/organization/departments${queryParams.toString() ? `?${queryParams}` : ''}`;
  const response = await fetchWithTimeout(url, {
    method: 'GET',
    headers,
    credentials: 'include',
    cache: 'no-store'
  }, 10000);

  if (!response.ok) throw new Error('Failed to fetch departments');
  const json = await response.json() as ApiResponse<OrganizationDepartment[]>;
  return { data: json.data || [], count: json.count || 0 };
}

// DOCUMENTS
export interface OrganizationDocument {
  id: string;
  company_id: string;
  company_name: string;
  employee_name?: string;
  document_type: string;
  document_name: string;
  file_url: string;
  upload_date: string;
  status: 'pending' | 'approved' | 'rejected';
}

export async function getOrganizationDocuments(params?: {
  company_id?: string;
  status?: string;
}): Promise<{ data: OrganizationDocument[]; count: number }> {
  const headers = await getAuthCookieHeader();
  const queryParams = new URLSearchParams();
  if (params?.company_id) queryParams.append('company_id', params.company_id);
  if (params?.status) queryParams.append('status', params.status);
  
  const url = `${API_BASE_URL}/api/organization/documents${queryParams.toString() ? `?${queryParams}` : ''}`;
  const response = await fetchWithTimeout(url, {
    method: 'GET',
    headers,
    credentials: 'include',
    cache: 'no-store'
  }, 10000);

  if (!response.ok) throw new Error('Failed to fetch documents');
  const json = await response.json() as ApiResponse<OrganizationDocument[]>;
  return { data: json.data || [], count: json.count || 0 };
}

// COMPANY DOCUMENTS
export interface OrganizationCompanyDocument {
  id: string;
  company_id: string;
  company_name: string;
  name: string;
  document_type: string;
  file_path: string;
  expiry_date?: string;
  created_at?: string;
}

export async function getOrganizationCompanyDocuments(params?: {
  company_id?: string;
  document_type?: string;
}): Promise<{ data: OrganizationCompanyDocument[]; count: number }> {
  const headers = await getAuthCookieHeader();
  const queryParams = new URLSearchParams();
  if (params?.company_id) queryParams.append('company_id', params.company_id);
  if (params?.document_type) queryParams.append('document_type', params.document_type);
  
  const url = `${API_BASE_URL}/api/organization/company-documents${queryParams.toString() ? `?${queryParams}` : ''}`;
  const response = await fetchWithTimeout(url, {
    method: 'GET',
    headers,
    credentials: 'include',
    cache: 'no-store'
  }, 10000);

  if (!response.ok) throw new Error('Failed to fetch company documents');
  const json = await response.json() as ApiResponse<OrganizationCompanyDocument[]>;
  return { data: json.data || [], count: json.count || 0 };
}
