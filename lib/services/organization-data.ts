/**
 * Organization Data Services
 * Organization Admin: View consolidated data across all companies
 */

import { fetchWithTimeout } from "@/lib/http/request.server";
import { getAuthCookieHeader } from "@/lib/auth/server-utils";
import { API_BASE_URL } from "@/lib/config";

// PAYROLLS
// Backend response interface
interface BackendPayroll {
  id: string;
  company_id: string;
  organization_id: string;
  pay_schedule_id: string;
  period_start: string;
  period_end: string;
  pay_date: string;
  status: "calculated" | "processed";
  employee_count: number;
  total_gross_pay: number;
  total_net_pay: number;
  total_deductions: number;
  total_taxes: number;
  created_at: string;
  updated_at: string;
}

// Frontend interface (with company_name from join)
export interface OrganizationPayroll {
  id: string;
  company_id: string;
  company_name?: string;
  pay_period_start: string;
  pay_period_end: string;
  pay_date?: string;
  status: "calculated" | "processed";
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
  if (params?.company_id) queryParams.append("company_id", params.company_id);
  if (params?.status) queryParams.append("status", params.status);

  const url = `${API_BASE_URL}/api/reports/organization/payroll${queryParams.toString() ? `?${queryParams}` : ""}`;

  try {
    const response = await fetchWithTimeout(
      url,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(cookieHeader && { Cookie: cookieHeader }),
        },
        credentials: "include",
        cache: "no-store",
      },
      10000,
    );

    // Handle authentication errors - return empty for SSR
    if (response.status === 401) {
      console.error(
        "[getOrganizationPayrolls] 401 Unauthorized - Session expired or not authenticated",
      );
      return { data: [], count: 0 };
    }

    // Handle permission errors - return empty for SSR
    if (response.status === 403) {
      console.error(
        "[getOrganizationPayrolls] 403 Forbidden - Permission denied to view organization payrolls",
      );
      return { data: [], count: 0 };
    }

    // Handle not found - return empty array
    if (response.status === 404) {
      console.warn(
        "[getOrganizationPayrolls] 404 Not Found - Endpoint may not be implemented in backend",
      );
      return { data: [], count: 0 };
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(
        `[getOrganizationPayrolls] Failed [${response.status}]:`,
        errorData,
      );
      return { data: [], count: 0 };
    }

    const json = (await response.json()) as {
      payrolls?: BackendPayroll[];
      data?: BackendPayroll[];
      total?: number;
      count?: number;
    };
    // Backend returns { payrolls: [], total: ... }
    const backendPayrolls: BackendPayroll[] = json.payrolls || json.data || [];

    // Map backend fields to frontend interface
    const mappedPayrolls: OrganizationPayroll[] = backendPayrolls.map(
      (p: BackendPayroll) => {
        const rawPayroll = p as BackendPayroll & {
          company_name?: string;
          pay_period_start?: string;
          pay_period_end?: string;
          total_employees?: number;
          gross_amount?: number;
          net_amount?: number;
        };
        
        return {
          id: p.id,
          company_id: p.company_id,
          company_name: rawPayroll.company_name || "",
          pay_period_start: rawPayroll.pay_period_start || p.period_start,
          pay_period_end: rawPayroll.pay_period_end || p.period_end,
          pay_date: p.pay_date,
          status: p.status,
          total_employees: rawPayroll.total_employees ?? p.employee_count,
          gross_amount: rawPayroll.gross_amount ?? p.total_gross_pay,
          net_amount: rawPayroll.net_amount ?? p.total_net_pay,
          total_deductions: p.total_deductions,
          created_at: p.created_at,
        };
      },
    );

    return {
      data: mappedPayrolls,
      count: json.total || json.count || mappedPayrolls.length,
    };
  } catch (error) {
    // Network errors or timeout - return empty for SSR stability
    console.error("[getOrganizationPayrolls] Exception:", error);
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
  status: "draft" | "submitted" | "approved" | "rejected";
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
  if (params?.company_id) queryParams.append("company_id", params.company_id);
  if (params?.status) queryParams.append("status", params.status);

  const url = `${API_BASE_URL}/api/reports/organization/timesheets${queryParams.toString() ? `?${queryParams}` : ""}`;

  try {
    const response = await fetchWithTimeout(
      url,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(cookieHeader && { Cookie: cookieHeader }),
        },
        credentials: "include",
        cache: "no-store",
      },
      10000,
    );

    if (response.status === 401) {
      console.error("Session expired or not authenticated");
      return { data: [], count: 0 };
    }

    if (response.status === 403) {
      console.error("Permission denied to view organization timesheets");
      return { data: [], count: 0 };
    }

    if (response.status === 404) {
      console.warn("No organization timesheets found");
      return { data: [], count: 0 };
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(
        `Failed to fetch organization timesheets [${response.status}]:`,
        errorData,
      );
      return { data: [], count: 0 };
    }

    const json = (await response.json()) as {
      timesheets?: OrganizationTimesheet[];
      data?: OrganizationTimesheet[];
      total?: number;
      count?: number;
    };
    // Backend returns { timesheets: [], total: ... }
    const timesheets = json.timesheets || json.data || [];
    return {
      data: timesheets,
      count: json.total || json.count || timesheets.length,
    };
  } catch (error) {
    console.error("Exception fetching organization timesheets:", error);
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
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";
}

export async function getOrganizationLeaves(params?: {
  company_id?: string;
  status?: string;
}): Promise<{ data: OrganizationLeave[]; count: number }> {
  const cookieHeader = await getAuthCookieHeader();
  const queryParams = new URLSearchParams();
  if (params?.company_id) queryParams.append("company_id", params.company_id);
  if (params?.status) queryParams.append("status", params.status);

  const url = `${API_BASE_URL}/api/reports/organization/leave${queryParams.toString() ? `?${queryParams}` : ""}`;

  try {
    const response = await fetchWithTimeout(
      url,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(cookieHeader && { Cookie: cookieHeader }),
        },
        credentials: "include",
        cache: "no-store",
      },
      10000,
    );

    if (response.status === 401) {
      console.error("Session expired or not authenticated");
      return { data: [], count: 0 };
    }

    if (response.status === 403) {
      console.error("Permission denied to view organization leaves");
      return { data: [], count: 0 };
    }

    if (response.status === 404) {
      console.warn("No organization leaves found");
      return { data: [], count: 0 };
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(
        `Failed to fetch organization leaves [${response.status}]:`,
        errorData,
      );
      return { data: [], count: 0 };
    }

    const json = (await response.json()) as {
      leaves?: OrganizationLeave[];
      data?: OrganizationLeave[];
      total?: number;
      count?: number;
    };
    // Backend may return { leaves: [], total: ... } or { data: [], count: ... }
    const leaves = json.leaves || json.data || [];
    return { data: leaves, count: json.total || json.count || leaves.length };
  } catch (error) {
    console.error("Exception fetching organization leaves:", error);
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
  parent_department_id?: string | null;
  parent_department_name?: string | null;
  manager_name?: string;
  employees_count: number;
  is_active: boolean;
}

export async function getOrganizationDepartments(params?: {
  company_id?: string;
}): Promise<{ data: OrganizationDepartment[]; count: number }> {
  const cookieHeader = await getAuthCookieHeader();
  const queryParams = new URLSearchParams();
  if (params?.company_id) queryParams.append("company_id", params.company_id);

  const url = `${API_BASE_URL}/api/reports/organization/departments${queryParams.toString() ? `?${queryParams}` : ""}`;

  try {
    const response = await fetchWithTimeout(
      url,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(cookieHeader && { Cookie: cookieHeader }),
        },
        credentials: "include",
        cache: "no-store",
      },
      10000,
    );

    if (response.status === 401) {
      console.error("Session expired or not authenticated");
      return { data: [], count: 0 };
    }

    if (response.status === 403) {
      console.error("Permission denied to view organization departments");
      return { data: [], count: 0 };
    }

    if (response.status === 404) {
      console.warn("No organization departments found");
      return { data: [], count: 0 };
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(
        `Failed to fetch organization departments [${response.status}]:`,
        errorData,
      );
      return { data: [], count: 0 };
    }

    const json = (await response.json()) as {
      departments?: OrganizationDepartment[];
      data?: OrganizationDepartment[];
      total?: number;
      count?: number;
    };
    // Backend may return { departments: [], total: ... } or { data: [], count: ... }
    const departments = json.departments || json.data || [];
    return {
      data: departments,
      count: json.total || json.count || departments.length,
    };
  } catch (error) {
    console.error("Exception fetching organization departments:", error);
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
  status: "pending" | "approved" | "rejected";
}

export async function getOrganizationDocuments(params?: {
  company_id?: string;
  status?: string;
}): Promise<{ data: OrganizationDocument[]; count: number }> {
  const cookieHeader = await getAuthCookieHeader();
  const queryParams = new URLSearchParams();
  if (params?.company_id) queryParams.append("company_id", params.company_id);
  if (params?.status) queryParams.append("status", params.status);

  const url = `${API_BASE_URL}/api/reports/organization/documents${queryParams.toString() ? `?${queryParams}` : ""}`;

  try {
    const response = await fetchWithTimeout(
      url,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(cookieHeader && { Cookie: cookieHeader }),
        },
        credentials: "include",
        cache: "no-store",
      },
      10000,
    );

    if (response.status === 401) {
      console.error("Session expired or not authenticated");
      return { data: [], count: 0 };
    }

    if (response.status === 403) {
      console.error("Permission denied to view organization documents");
      return { data: [], count: 0 };
    }

    if (response.status === 404) {
      console.warn("No organization documents found");
      return { data: [], count: 0 };
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(
        `Failed to fetch organization documents [${response.status}]:`,
        errorData,
      );
      return { data: [], count: 0 };
    }

    const json = (await response.json()) as {
      documents?: OrganizationDocument[];
      data?: OrganizationDocument[];
      total?: number;
      count?: number;
    };
    // Backend may return { documents: [], total: ... } or { data: [], count: ... }
    const documents = json.documents || json.data || [];
    return {
      data: documents,
      count: json.total || json.count || documents.length,
    };
  } catch (error) {
    console.error("Exception fetching organization documents:", error);
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
  if (params?.company_id) queryParams.append("company_id", params.company_id);
  if (params?.document_type)
    queryParams.append("document_type", params.document_type);

  const url = `${API_BASE_URL}/api/reports/organization/company-documents${queryParams.toString() ? `?${queryParams}` : ""}`;

  try {
    const response = await fetchWithTimeout(
      url,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(cookieHeader && { Cookie: cookieHeader }),
        },
        credentials: "include",
        cache: "no-store",
      },
      10000,
    );

    if (response.status === 401) {
      console.error("Session expired or not authenticated");
      return { data: [], count: 0 };
    }

    if (response.status === 403) {
      console.error("Permission denied to view organization company documents");
      return { data: [], count: 0 };
    }

    if (response.status === 404) {
      console.warn("No organization company documents found");
      return { data: [], count: 0 };
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(
        `Failed to fetch organization company documents [${response.status}]:`,
        errorData,
      );
      return { data: [], count: 0 };
    }

    const json = (await response.json()) as {
      company_documents?: OrganizationCompanyDocument[];
      data?: OrganizationCompanyDocument[];
      total?: number;
      count?: number;
    };
    // Backend may return { company_documents: [], total: ... } or { data: [], count: ... }
    const companyDocuments = json.company_documents || json.data || [];
    return {
      data: companyDocuments,
      count: json.total || json.count || companyDocuments.length,
    };
  } catch (error) {
    console.error("Exception fetching organization company documents:", error);
    return { data: [], count: 0 };
  }
}
