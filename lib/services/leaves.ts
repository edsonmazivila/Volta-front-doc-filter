"use server";
import { cache } from "react";
import { getAuthCookieHeader } from "@/lib/auth/server-utils";
import { API_BASE_URL } from "@/lib/config";
import { z } from "zod";
import { revalidateEntityMutation } from "@/lib/cache-utils";

// Types
export type LeaveStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

export interface LeaveRequestItem {
  id: string;
  employee_id?: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  total_days: number;
  total_hours?: number;
  is_half_day?: boolean;
  reason?: string;
  status: LeaveStatus;
  created_at?: string;
  submitted_at?: string;
  employee_full_name?: string;
  employee_number?: string;
  approved_at?: string;
  approved_by?: string;
  approved_notes?: string;
  approver_full_name?: string;
}

export interface LeaveBalanceItem {
  leave_type: string;
  remaining_days: number;
  pending_days?: number;
}

export interface TeamBalanceItem {
  employee_id: string;
  employee_name: string;
  employee_email?: string;
  leave_type: string;
  remaining_days: number;
  pending_days?: number;
  total_used?: number;
}

export interface ActionResult {
  success?: boolean;
  data?: unknown;
  errors?: {
    _form?: string[];
    [key: string]: string[] | undefined;
  };
}

// Validation schemas
const createLeaveSchema = z.object({
  leave_type: z.string().min(1, "Leave type is required"),
  // Accept either YYYY-MM-DD or full ISO; normalize later
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  is_half_day: z.boolean().default(false),
  reason: z.string().optional(),
});

// READ operations (cached)
export const getMyLeaveRequests = cache(
  async (params?: {
    status?: string;
    type?: string;
  }): Promise<LeaveRequestItem[]> => {
    try {
      const qs = new URLSearchParams();
      if (params?.status) qs.append("status", params.status);
      if (params?.type) qs.append("leave_type", params.type);

      const cookieHeader = await getAuthCookieHeader();
      const res = await fetch(
        `${API_BASE_URL}/api/leave-requests/my${qs.toString() ? `?${qs}` : ""}`,
        {
          headers: {
            "Content-Type": "application/json",
            ...(cookieHeader && { Cookie: cookieHeader }),
          },
          next: { tags: ["leave-requests"], revalidate: 60 },
        }
      );

      if (!res.ok) {
        throw new Error(`Failed to fetch leave requests: ${res.status}`);
      }

      const data = await res.json();
      return data?.requests || [];
    } catch {
      return [];
    }
  }
);

export const getLeaveRequests = cache(
  async (params?: {
    q?: string;
    status?: string;
    type?: string;
    page?: number;
    pageSize?: number;
    employeeId?: string;
  }): Promise<{
    requests: LeaveRequestItem[];
    total: number;
    page: number;
    limit: number;
  }> => {
    try {
      const qs = new URLSearchParams();
      if (params?.q) qs.append("q", params.q);
      if (params?.status) qs.append("status", params.status);
      if (params?.type) qs.append("leave_type", params.type);
      if (params?.employeeId) qs.append("employee_id", params.employeeId);
      if (params?.page) qs.append("page", String(params.page));
      if (params?.pageSize) qs.append("limit", String(params.pageSize));

      const cookieHeader = await getAuthCookieHeader();
      const res = await fetch(
        `${API_BASE_URL}/api/leave-requests${qs.toString() ? `?${qs}` : ""}`,
        {
          headers: {
            "Content-Type": "application/json",
            ...(cookieHeader && { Cookie: cookieHeader }),
          },
          next: { tags: ["leave-requests"], revalidate: 60 },
        }
      );

      if (!res.ok) {
        throw new Error(`Failed to fetch leave requests: ${res.status}`);
      }

      const data = await res.json().catch(() => ({}));
      const requests = data?.requests || data?.data || [];
      const total = data?.total ?? requests.length;
      const page = data?.page ?? 1;
      const limit = data?.limit ?? (params?.pageSize || 20);
      return { requests, total, page, limit };
    } catch {
      return { requests: [], total: 0, page: 1, limit: params?.pageSize || 20 };
    }
  }
);

export const getPendingApprovals = cache(
  async (): Promise<LeaveRequestItem[]> => {
    try {
      const cookieHeader = await getAuthCookieHeader();
      const res = await fetch(
        `${API_BASE_URL}/api/leave-requests/pending-approvals`,
        {
          headers: {
            "Content-Type": "application/json",
            ...(cookieHeader && { Cookie: cookieHeader }),
          },
          next: { tags: ["pending-approvals"], revalidate: 60 },
        }
      );

      if (!res.ok) {
        throw new Error(`Failed to fetch pending approvals: ${res.status}`);
      }

      const data = await res.json();
      return data?.requests || [];
    } catch {
      return [];
    }
  }
);

export const getLeaveBalances = cache(async (): Promise<LeaveBalanceItem[]> => {
  try {
    const cookieHeader = await getAuthCookieHeader();
    const res = await fetch(`${API_BASE_URL}/api/leave-balances/me`, {
      headers: {
        "Content-Type": "application/json",
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      next: { tags: ["leave-balances"], revalidate: 60 },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch leave balances: ${res.status}`);
    }

    const data = await res.json();
    return data?.balances || [];
  } catch {
    return [];
  }
});

export interface LeaveOverviewItem {
  userId: string
  fullName: string
  leaveType: string
  startDate: string
  endDate: string
}

export interface LeavesOverview {
  upcomingLeaves: LeaveOverviewItem[]
  currentlyOut: LeaveOverviewItem[] | null
}

export const getLeavesOverview = cache(async (): Promise<LeavesOverview> => {
  try {
    const cookieHeader = await getAuthCookieHeader()
    const res = await fetch(`${API_BASE_URL}/api/attendance/leaves/overview`, {
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      next: { tags: ['leave-requests', 'leaves-overview'], revalidate: 60 },
    })

    if (!res.ok) {
      throw new Error(`Failed to fetch leaves overview: ${res.status}`)
    }

    const data = await res.json()
    return {
      upcomingLeaves: data.upcomingLeaves || [],
      currentlyOut: data.currentlyOut || [],
    }
  } catch {
    return {
      upcomingLeaves: [],
      currentlyOut: [],
    }
  }
})

export const getTeamBalances = cache(async (): Promise<TeamBalanceItem[]> => {
  try {
    const cookieHeader = await getAuthCookieHeader();
    const res = await fetch(`${API_BASE_URL}/api/leave-balances/team`, {
      headers: {
        "Content-Type": "application/json",
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      next: { tags: ["leave-balances"], revalidate: 60 },
    });

    if (!res.ok) {
      console.error("Failed to fetch team balances:", res.status);
      return [];
    }

    const data = await res.json();
    const rawBalances = data?.balances || data?.team_balances || [];

    interface RawTeamBalance {
      employee_id?: string | number;
      employee_name?: string;
      employee_email?: string;
      vacation_balance?: number;
      sick_balance?: number;
      personal_balance?: number;
      total_used?: number;
      balances?: Array<{
        leave_type?: string;
        remaining_days?: number;
        pending_days?: number;
        total_used?: number;
      }>;
    }

    const toTeamBalanceItems = (item: RawTeamBalance): TeamBalanceItem[] => {
      const employeeId = String(item.employee_id || "");
      const employeeName = item.employee_name || `Employee #${employeeId}`;
      const employeeEmail = item.employee_email;

      const emit = (
        leaveType: string,
        remaining?: number,
        pending?: number,
        totalUsed?: number
      ): TeamBalanceItem[] => {
        if (typeof remaining !== "number") return [];
        return [
          {
            employee_id: employeeId,
            employee_name: employeeName,
            employee_email: employeeEmail,
            leave_type: leaveType,
            remaining_days: remaining,
            pending_days: pending,
            total_used: totalUsed,
          },
        ];
      };

      // Prefer balances array if provided (newer API shape)
      if (Array.isArray(item.balances) && item.balances.length > 0) {
        return item.balances.flatMap((balance) =>
          emit(
            balance.leave_type || "other",
            balance.remaining_days,
            balance.pending_days,
            balance.total_used
          )
        );
      }

      // Fallback to legacy fields for specific leave types
      return [
        ...emit("vacation", item.vacation_balance, undefined, item.total_used),
        ...emit("sick", item.sick_balance, undefined, item.total_used),
        ...emit("personal", item.personal_balance, undefined, item.total_used),
      ];
    };

    return (rawBalances as RawTeamBalance[]).flatMap(toTeamBalanceItems);
  } catch {
    console.error("Error fetching team balances");
    return [];
  }
});

// Server Actions for mutations

export async function createLeaveRequestAction(
  prevState: unknown,
  formData: FormData
): Promise<ActionResult> {
  const startRaw = String(formData.get("start_date") || "")
  const endRaw = String(formData.get("end_date") || "")
  // Backend expects RFC3339 timestamps
  const start_date = startRaw.includes('T') ? startRaw : `${startRaw}T00:00:00Z`
  const end_date = endRaw.includes('T') ? endRaw : `${endRaw}T23:59:59Z`

  const parsed = createLeaveSchema.safeParse({
    leave_type: formData.get("leave_type"),
    start_date,
    end_date,
    is_half_day:
      formData.get("is_half_day") === "true" ||
      formData.get("is_half_day") === "on",
    reason: formData.get("reason") || "",
  });

  if (!parsed.success) {
    console.error('[leaves] createLeaveRequestAction validation failed', parsed.error.flatten())
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    const cookieHeader = await getAuthCookieHeader();
    console.debug('[leaves] createLeaveRequestAction payload', parsed.data)
    const res = await fetch(`${API_BASE_URL}/api/leave-requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      body: JSON.stringify(parsed.data),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      console.error('[leaves] createLeaveRequestAction failed', res.status, text)
      let error: { message?: string } = {}
      try { error = text ? JSON.parse(text) : {} } catch {}
      return {
        errors: { _form: [error.message || "Failed to create leave request"] },
      };
    }

    const data = await res.json();
    console.debug('[leaves] createLeaveRequestAction success', data)
    // Revalidate leaves caches and pages
    revalidateEntityMutation("LEAVES", { additionalTags: ["leave-requests"], additionalPaths: ["/dashboard/my-leaves"] });

    return { success: true, data };
  } catch {
    console.error('[leaves] createLeaveRequestAction threw')
    return { errors: { _form: ["Failed to create leave request"] } };
  }
}

export async function updateLeaveRequestAction(
  id: string,
  prevState: unknown,
  formData: FormData
): Promise<ActionResult> {
  const parsed = createLeaveSchema
    .partial({
      leave_type: true,
      start_date: true,
      end_date: true,
      is_half_day: true,
      reason: true,
    })
    .safeParse({
      leave_type: formData.get("leave_type") || undefined,
      start_date: formData.get("start_date") || undefined,
      end_date: formData.get("end_date") || undefined,
      is_half_day:
        formData.get("is_half_day") === "true" ||
        formData.get("is_half_day") === "on"
          ? true
          : formData.get("is_half_day")
          ? false
          : undefined,
      reason: formData.get("reason") || undefined,
    });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    const cookieHeader = await getAuthCookieHeader();
    const res = await fetch(`${API_BASE_URL}/api/leave-requests/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      body: JSON.stringify(parsed.data),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      return {
        errors: { _form: [error.message || "Failed to update leave request"] },
      };
    }

    const data = await res.json().catch(() => ({}));
    revalidateEntityMutation("LEAVES", { additionalTags: ["leave-requests"], additionalPaths: ["/dashboard/my-leaves"] });
    return { success: true, data };
  } catch {
    return { errors: { _form: ["Failed to update leave request"] } };
  }
}

export async function submitLeaveRequestAction(id: string): Promise<void> {
  const cookieHeader = await getAuthCookieHeader();
  const res = await fetch(`${API_BASE_URL}/api/leave-requests/${id}/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cookieHeader && { Cookie: cookieHeader }),
    },
    body: JSON.stringify({}),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to submit leave request");
  }

  // Revalidate leaves caches and pages
  revalidateEntityMutation("LEAVES", { additionalTags: ["leave-requests"], additionalPaths: ["/dashboard/my-leaves"] });
}

export async function cancelLeaveRequestAction(
  id: string,
  reason?: string
): Promise<void> {
  const cookieHeader = await getAuthCookieHeader();
  const res = await fetch(`${API_BASE_URL}/api/leave-requests/${id}/cancel`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cookieHeader && { Cookie: cookieHeader }),
    },
    body: JSON.stringify({ reason }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to cancel leave request");
  }

  // Revalidate leaves caches and pages
  revalidateEntityMutation("LEAVES", { additionalTags: ["leave-requests"], additionalPaths: ["/dashboard/my-leaves"] });
}

export async function approveLeaveAction(
  id: string,
  notes?: string
): Promise<void> {
  const cookieHeader = await getAuthCookieHeader();
  console.log(`[APPROVE_LEAVE] Approving leave request ${id} with notes:`, notes);
  const res = await fetch(
    `${API_BASE_URL}/api/leave-requests/${id}/approve`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      body: JSON.stringify({ notes: notes || "" }),
    }
  );

  console.log(`[APPROVE_LEAVE] Response status: ${res.status}`);
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    console.error(`[APPROVE_LEAVE] Error response:`, error);
    throw new Error(error.message || "Failed to approve leave request");
  }

  // Revalidate leaves caches and pages
  revalidateEntityMutation("LEAVES", { additionalTags: ["leave-requests", "pending-approvals"], additionalPaths: ["/dashboard/leaves", "/dashboard/my-leaves"] });
}

// Legacy aliases for backward compatibility
export const approveL1Action = approveLeaveAction;
export const approveFinalAction = approveLeaveAction;

export async function rejectLeaveRequestAction(
  id: string,
  reason: string
): Promise<void> {
  const cookieHeader = await getAuthCookieHeader();
  console.log(`[REJECT_LEAVE] Rejecting leave request ${id} with reason:`, reason);
  const res = await fetch(`${API_BASE_URL}/api/leave-requests/${id}/reject`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cookieHeader && { Cookie: cookieHeader }),
    },
    body: JSON.stringify({ reason }),
  });

  console.log(`[REJECT_LEAVE] Response status: ${res.status}`);
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    console.error(`[REJECT_LEAVE] Error response:`, error);
    throw new Error(error.message || "Failed to reject leave request");
  }

	// Revalidate leaves caches so dashboards and personal pages update
	revalidateEntityMutation("LEAVES", { additionalTags: ["leave-requests", "pending-approvals"], additionalPaths: ["/dashboard/leaves", "/dashboard/my-leaves"] });
}
