/**
 * Organization Data Services
 * Organization Admin: View consolidated data across all companies
 */

import { fetchWithTimeout } from '@/lib/http/request.server';
import { getAuthCookieHeader } from '@/lib/auth/server-utils';
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
  status: 'calculated' | 'processed';
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
  const cookieHeader = await getAuthCookieHeader();
  const queryParams = new URLSearchParams();
  if (params?.company_id) queryParams.append('company_id', params.company_id);
  if (params?.status) queryParams.append('status', params.status);
  
  const url = `${API_BASE_URL}/api/reports/organization/payroll${queryParams.toString() ? `?${queryParams}` : ''}`;
  
  try {
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader })
      },
      credentials: 'include',
      cache: 'no-store'
    }, 10000);

    // Handle authentication errors - return empty for SSR
    if (response.status === 401) {
      console.error('[getOrganizationPayrolls] 401 Unauthorized - Session expired or not authenticated');
      return { data: [], count: 0 };
    }

    // Handle permission errors - return empty for SSR
    if (response.status === 403) {
      console.error('[getOrganizationPayrolls] 403 Forbidden - Permission denied to view organization payrolls');
      return { data: [], count: 0 };
    }

    // Handle not found - return empty array
    if (response.status === 404) {
      console.warn('[getOrganizationPayrolls] 404 Not Found - Endpoint may not be implemented in backend');
      return { data: [], count: 0 };
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`[getOrganizationPayrolls] Failed [${response.status}]:`, errorData);
      return { data: [], count: 0 };
    }

    const json = await response.json() as ApiResponse<OrganizationPayroll[]>;
    return { data: json.data || [], count: json.count || 0 };
  } catch (error) {
    // Network errors or timeout - return empty for SSR stability
    console.error('[getOrganizationPayrolls] Exception:', error);
    return { data: [], count: 0 };
  }
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
  const cookieHeader = await getAuthCookieHeader();
  const queryParams = new URLSearchParams();
  if (params?.company_id) queryParams.append('company_id', params.company_id);
  if (params?.status) queryParams.append('status', params.status);
  
  const url = `${API_BASE_URL}/api/reports/organization/timesheets${queryParams.toString() ? `?${queryParams}` : ''}`;
  
  try {
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader })
      },
      credentials: 'include',
      cache: 'no-store'
    }, 10000);

    if (response.status === 401) {
      console.error('Session expired or not authenticated');
      return { data: [], count: 0 };
    }

    if (response.status === 403) {
      console.error('Permission denied to view organization timesheets');
      return { data: [], count: 0 };
    }

    if (response.status === 404) {
      console.warn('No organization timesheets found');
      return { data: [], count: 0 };
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`Failed to fetch organization timesheets [${response.status}]:`, errorData);
      return { data: [], count: 0 };
    }

    const json = await response.json() as ApiResponse<OrganizationTimesheet[]>;
    return { data: json.data || [], count: json.count || 0 };
  } catch (error) {
    console.error('Exception fetching organization timesheets:', error);
    return { data: [], count: 0 };
  }
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
  const cookieHeader = await getAuthCookieHeader();
  const queryParams = new URLSearchParams();
  if (params?.company_id) queryParams.append('company_id', params.company_id);
  if (params?.status) queryParams.append('status', params.status);
  
  const url = `${API_BASE_URL}/api/reports/organization/leave${queryParams.toString() ? `?${queryParams}` : ''}`;
  
  try {
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader })
      },
      credentials: 'include',
      cache: 'no-store'
    }, 10000);

    if (response.status === 401) {
      console.error('Session expired or not authenticated');
      return { data: [], count: 0 };
    }

    if (response.status === 403) {
      console.error('Permission denied to view organization leaves');
      return { data: [], count: 0 };
    }

    if (response.status === 404) {
      console.warn('No organization leaves found');
      return { data: [], count: 0 };
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`Failed to fetch organization leaves [${response.status}]:`, errorData);
      return { data: [], count: 0 };
    }

    const json = await response.json() as ApiResponse<OrganizationLeave[]>;
    return { data: json.data || [], count: json.count || 0 };
  } catch (error) {
    console.error('Exception fetching organization leaves:', error);
    return { data: [], count: 0 };
  }
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
  const cookieHeader = await getAuthCookieHeader();
  const queryParams = new URLSearchParams();
  if (params?.company_id) queryParams.append('company_id', params.company_id);
  
  const url = `${API_BASE_URL}/api/reports/organization/departments${queryParams.toString() ? `?${queryParams}` : ''}`;
  
  try {
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader })
      },
      credentials: 'include',
      cache: 'no-store'
    }, 10000);

    if (response.status === 401) {
      console.error('Session expired or not authenticated');
      return { data: [], count: 0 };
    }

    if (response.status === 403) {
      console.error('Permission denied to view organization departments');
      return { data: [], count: 0 };
    }

    if (response.status === 404) {
      console.warn('No organization departments found');
      return { data: [], count: 0 };
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`Failed to fetch organization departments [${response.status}]:`, errorData);
      return { data: [], count: 0 };
    }

    const json = await response.json() as ApiResponse<OrganizationDepartment[]>;
    
    return { data: json.data || [], count: json.count || 0 };
  } catch (error) {
    console.error('Exception fetching organization departments:', error);
    return { data: [], count: 0 };
  }
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
  const cookieHeader = await getAuthCookieHeader();
  const queryParams = new URLSearchParams();
  if (params?.company_id) queryParams.append('company_id', params.company_id);
  if (params?.status) queryParams.append('status', params.status);
  
  const url = `${API_BASE_URL}/api/reports/organization/documents${queryParams.toString() ? `?${queryParams}` : ''}`;

  try {
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader })
      },
      credentials: 'include',
      cache: 'no-store'
    }, 10000);

    if (response.status === 401) {
      console.error('Session expired or not authenticated');
      return { data: [], count: 0 };
    }

    if (response.status === 403) {
      console.error('Permission denied to view organization documents');
      return { data: [], count: 0 };
    }

    if (response.status === 404) {
      console.warn('No organization documents found');
      return { data: [], count: 0 };
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`Failed to fetch organization documents [${response.status}]:`, errorData);
      return { data: [], count: 0 };
    }

    const json = await response.json() as ApiResponse<OrganizationDocument[]>;
    
    return { data: json.data || [], count: json.count || 0 };
  } catch (error) {
    console.error('Exception fetching organization documents:', error);
    return { data: [], count: 0 };
  }
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
  const cookieHeader = await getAuthCookieHeader();
  const queryParams = new URLSearchParams();
  if (params?.company_id) queryParams.append('company_id', params.company_id);
  if (params?.document_type) queryParams.append('document_type', params.document_type);
  
  const url = `${API_BASE_URL}/api/reports/organization/company-documents${queryParams.toString() ? `?${queryParams}` : ''}`;
  
  try {
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader })
      },
      credentials: 'include',
      cache: 'no-store'
    }, 10000);

    if (response.status === 401) {
      console.error('Session expired or not authenticated');
      return { data: [], count: 0 };
    }

    if (response.status === 403) {
      console.error('Permission denied to view organization company documents');
      return { data: [], count: 0 };
    }

    if (response.status === 404) {
      console.warn('No organization company documents found');
      return { data: [], count: 0 };
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`Failed to fetch organization company documents [${response.status}]:`, errorData);
      return { data: [], count: 0 };
    }

    const json = await response.json() as ApiResponse<OrganizationCompanyDocument[]>;
    return { data: json.data || [], count: json.count || 0 };
  } catch (error) {
    console.error('Exception fetching organization company documents:', error);
    return { data: [], count: 0 };
  }
}
