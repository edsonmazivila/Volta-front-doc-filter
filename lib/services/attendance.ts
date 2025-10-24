"use server";
import { cache } from "react";
import { API_BASE_URL } from "@/lib/config";
import { getAuthCookieHeader } from "@/lib/auth/server-utils";
import { z } from "zod";
import type {
  AttendanceRecord,
  AttendanceStats,
  AttendanceJustification,
  AttendanceFilters,
} from "@/lib/types/attendance";
import {
  revalidateEntityMutation,
  CacheTags,
  fetchWithGracefulFallback,
} from "@/lib/cache-utils";
import { toIsoUtc } from "@/lib/utils";
import { getUser } from '@/lib/auth/dal'

// Get attendance records with optional filters
export const getAttendanceRecords = cache(
  async (filters?: AttendanceFilters): Promise<AttendanceRecord[]> => {
    return fetchWithGracefulFallback(
      async () => {
        const authHeader = await getAuthCookieHeader();

        const params = new URLSearchParams();
        if (filters?.month) params.append("month", filters.month);
        // Updated to use userId instead of employee_id
        if (filters?.employee_id)
          params.append("userId", String(filters.employee_id));
        if (filters?.status) params.append("status", filters.status);

        const url = `${API_BASE_URL}/api/attendance${
          params.toString() ? `?${params.toString()}` : ""
        }`;

        const res = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            ...(authHeader && { Cookie: authHeader }),
          },
          next: { tags: [CacheTags.ATTENDANCE], revalidate: 30 },
        });

        if (!res.ok) throw new Error("Failed to fetch attendance");
        const data = await res.json();
        const raw = Array.isArray(data) ? data : (data.data || data.records || []);
        // Normalize fields from various API shapes
        return raw.map((r: Record<string, unknown>) => {
          const emp = (r.employee || r.user || r.employee_info) as Record<string, unknown> | undefined
          const nameField = emp?.full_name as string | undefined ?? emp?.name as string | undefined ?? r.full_name as string | undefined ?? r.employee_name as string | undefined
          return {
            id: String(r.id ?? r.attendance_id ?? ''),
            employee_id: String(r.employee_id ?? r.user_id ?? r.userId ?? ''),
            date: String(r.date ?? r.day ?? ''),
            status: String(r.status ?? 'present'),
            clock_in: r.clock_in ?? r.clockIn ?? undefined,
            clock_out: r.clock_out ?? r.clockOut ?? undefined,
            hours_worked: r.hours_worked ?? r.hours ?? undefined,
            justification: r.justification ?? r.reason ?? undefined,
            employee_name: String(nameField || r.employee_name || `Employee #${r.employee_id ?? r.user_id ?? r.userId}`),
            created_at: r.created_at ?? undefined,
            updated_at: r.updated_at ?? undefined,
          }
        })
      },
      [],
      { errorContext: "getAttendanceRecords" }
    );
  }
);

// Get attendance stats
export const getAttendanceStats = cache(async (): Promise<AttendanceStats> => {
  return fetchWithGracefulFallback(
    async () => {
      const authHeader = await getAuthCookieHeader();

      const res = await fetch(`${API_BASE_URL}/api/attendance/stats`, {
        headers: {
          "Content-Type": "application/json",
          ...(authHeader && { Cookie: authHeader }),
        },
        next: { tags: [CacheTags.ATTENDANCE_STATS], revalidate: 60 },
      });

      if (!res.ok) throw new Error("Failed to fetch attendance stats");
      const data = await res.json();
      return (
        data.data || {
          total_employees: 0,
          present_today: 0,
          absent_today: 0,
          pending_justifications: 0,
          average_attendance_rate: 0,
        }
      );
    },
    {
      total_employees: 0,
      present_today: 0,
      absent_today: 0,
      pending_justifications: 0,
      average_attendance_rate: 0,
    },
    { errorContext: "getAttendanceStats" }
  );
});

// Get pending justifications - Updated endpoint
export const getPendingJustifications = cache(
  async (): Promise<AttendanceJustification[]> => {
    return fetchWithGracefulFallback(
      async () => {
        const authHeader = await getAuthCookieHeader();

        const res = await fetch(
          `${API_BASE_URL}/api/attendance/justifications/pending`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(authHeader && { Cookie: authHeader }),
            },
            next: {
              tags: [CacheTags.ATTENDANCE_JUSTIFICATIONS],
              revalidate: 30,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch justifications");
        const data = await res.json();
        return data.data || data || [];
      },
      [],
      { errorContext: "getPendingJustifications" }
    );
  }
);

// Get my attendance records
export const getMyAttendance = cache(
  async (month?: string): Promise<AttendanceRecord[]> => {
    return fetchWithGracefulFallback(
      async () => {
        const authHeader = await getAuthCookieHeader();

        const params = month ? `?month=${month}` : "";
        const url = `${API_BASE_URL}/api/attendance${params}`;
        
        const res = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            ...(authHeader && { Cookie: authHeader }),
          },
          next: { tags: [CacheTags.MY_ATTENDANCE], revalidate: 30 },
        });
        
        if (!res.ok) {
          throw new Error("Failed to fetch my attendance");
        }
        
        const data = await res.json();
        
        // Try different possible data structures
        const allRecords = data.data || data.records || data || [];
        
        // Get current user to filter records
        const user = await getUser();
        if (!user) {
          return [];
        }
        
        // Filter records for current user
        const myRecords = allRecords.filter((record: Record<string, unknown>) => {
          // Check different possible user ID fields
          const userId = record.user_id || record.userId || record.employee_id || record.employeeId;
          return userId === user.id;
        });
        
        // Transform records to match AttendanceRecord interface
        const transformedRecords = myRecords.map((r: Record<string, unknown>) => {
          const emp = (r.employee || r.user || r.employee_info) as Record<string, unknown> | undefined
          const nameField = emp?.full_name as string | undefined ?? emp?.name as string | undefined ?? r.full_name as string | undefined ?? r.employee_name as string | undefined
          return {
            id: String(r.id ?? r.attendance_id ?? ''),
            employee_id: String(r.employee_id ?? r.user_id ?? r.userId ?? ''),
            date: String(r.date ?? r.day ?? ''),
            status: String(r.status ?? 'present') as 'present' | 'absent' | 'late' | 'half_day' | 'on_leave' | 'justified',
            clock_in: r.clock_in ?? r.clockIn ?? undefined,
            clock_out: r.clock_out ?? r.clockOut ?? undefined,
            hours_worked: r.hours_worked ?? r.hours ?? undefined,
            justification: r.justification ?? r.reason ?? undefined,
            employee_name: String(nameField || r.employee_name || `Employee #${r.employee_id ?? r.user_id ?? r.userId}`),
            created_at: r.created_at ?? undefined,
            updated_at: r.updated_at ?? undefined,
          }
        });
        
        return transformedRecords;
      },
      [],
      { errorContext: "getMyAttendance" }
    );
  }
);

// Server Actions
const attendanceSchema = z.object({
  employee_id: z.string().min(1, 'Employee is required'),
  date: z.string().min(1, 'Date is required'),
  status: z.enum(["present", "absent", "late", "half_day", "on_leave"]),
  clock_in: z.string().optional(),
  clock_out: z.string().optional(),
  justification: z.string().optional(),
});

export type ActionResult =
  | { success: true; data?: unknown }
  | { errors: { _form?: string[]; [key: string]: string[] | undefined } };

// My Attendance (current user) Actions

// Check-in action - Updated to match new API structure
export async function createMyAttendanceAction(
  _prevState: unknown,
  formData: FormData
): Promise<ActionResult> {
  const cookieHeader = await getAuthCookieHeader();
  
  try {
    // Get current user from session
    const user = await getUser();
    if (!user) {
      return { errors: { _form: ['User not authenticated'] } }
    }

    const clockIn = formData.get('clock_in') as string;
    const date = formData.get('date') as string;
    const timezone = formData.get('timezone') as string || Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    if (!clockIn) {
      return { errors: { _form: ['Clock in time is required'] } }
    }

    // Use current date if not provided
    const attendanceDate = date || new Date().toISOString().split('T')[0];

    const payload = {
      userId: user.id,
      clockIn: clockIn,
      date: attendanceDate,
      timezone: timezone
    };

    const res = await fetch(`${API_BASE_URL}/api/attendance/check-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(cookieHeader && { Cookie: cookieHeader }) },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      return { errors: { _form: [error.message || 'Failed to clock in'] } }
    }

    revalidateEntityMutation('MY_ATTENDANCE')
    return { success: true, data: await res.json() }
  } catch {
    return { errors: { _form: ['Network error'] } }
  }
}

export async function updateMyAttendanceAction(
  _prevState: unknown,
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const cookieHeader = await getAuthCookieHeader();
  const raw = {
    status: (formData.get('status') as string) || undefined,
    clock_in: (formData.get('clock_in') as string) || undefined,
    clock_out: (formData.get('clock_out') as string) || undefined,
    justification: (formData.get('justification') as string) || undefined,
  }
  try {
    const res = await fetch(`${API_BASE_URL}/api/attendance/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...(cookieHeader && { Cookie: cookieHeader }) },
      body: JSON.stringify(raw),
    })
    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      return { errors: { _form: [error.message || 'Failed to update attendance'] } }
    }
    revalidateEntityMutation('MY_ATTENDANCE')
    return { success: true }
  } catch {
    return { errors: { _form: ['Network error'] } }
  }
}

// Clock out action - Updated to match new API structure
export async function clockOutMyAttendanceAction(
  _prevState: unknown,
  formData: FormData
): Promise<ActionResult> {
  const cookieHeader = await getAuthCookieHeader();
  
  try {
    // Get current user from session
    const user = await getUser();
    if (!user) {
      return { errors: { _form: ['User not authenticated'] } }
    }

    const clockOut = formData.get('clock_out') as string;
    const date = formData.get('date') as string;
    const timezone = formData.get('timezone') as string || Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    if (!clockOut) {
      return { errors: { _form: ['Clock out time is required'] } }
    }

    // Use current date if not provided
    const attendanceDate = date || new Date().toISOString().split('T')[0];

    const payload = {
      userId: user.id,
      clockOut: clockOut,
      date: attendanceDate,
      timezone: timezone
    };

    const res = await fetch(`${API_BASE_URL}/api/attendance/check-out`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(cookieHeader && { Cookie: cookieHeader }) },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      return { errors: { _form: [error.message || 'Failed to clock out'] } }
    }

    revalidateEntityMutation('MY_ATTENDANCE')
    return { success: true, data: await res.json() }
  } catch {
    return { errors: { _form: ['Network error'] } }
  }
}

// Mark absence for a user (Manager/HR/Admin only)
export async function markAbsenceAction(
  _prevState: unknown,
  formData: FormData
): Promise<ActionResult> {
  const cookieHeader = await getAuthCookieHeader();
  
  try {
    const userId = formData.get('userId') as string;
    const date = formData.get('date') as string;
    const reason = formData.get('reason') as string;
    
    if (!userId || !date) {
      return { errors: { _form: ['User ID and date are required'] } }
    }

    const payload = {
      userId: userId,
      date: date,
      reason: reason || undefined
    };

    const res = await fetch(`${API_BASE_URL}/api/attendance/mark-absence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(cookieHeader && { Cookie: cookieHeader }) },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      return { errors: { _form: [error.message || 'Failed to mark absence'] } }
    }

    revalidateEntityMutation('ATTENDANCE')
    return { success: true, data: await res.json() }
  } catch {
    return { errors: { _form: ['Network error'] } }
  }
}

// Submit justification for own attendance
export async function submitJustificationAction(
  _prevState: unknown,
  formData: FormData
): Promise<ActionResult> {
  const cookieHeader = await getAuthCookieHeader();
  
  try {
    const date = formData.get('date') as string;
    const reason = formData.get('reason') as string;
    
    if (!date || !reason) {
      return { errors: { _form: ['Date and reason are required'] } }
    }

    const payload = {
      date: date,
      reason: reason
    };

    const res = await fetch(`${API_BASE_URL}/api/attendance/justifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(cookieHeader && { Cookie: cookieHeader }) },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      return { errors: { _form: [error.message || 'Failed to submit justification'] } }
    }

    revalidateEntityMutation('ATTENDANCE')
    revalidateEntityMutation('ATTENDANCE_JUSTIFICATIONS')
    return { success: true, data: await res.json() }
  } catch {
    return { errors: { _form: ['Network error'] } }
  }
}

export async function createAttendanceAction(
  prevState: unknown,
  formData: FormData
): Promise<ActionResult> {
  const cookieHeader = await getAuthCookieHeader();

  const rawData = {
    employee_id: String(formData.get("employee_id") || ''),
    date: formData.get("date") as string,
    status: formData.get("status") as string,
    clock_in: (formData.get("clock_in") as string) || undefined,
    clock_out: (formData.get("clock_out") as string) || undefined,
    justification: (formData.get("justification") as string) || undefined,
  };

  const result = attendanceSchema.safeParse(rawData);
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  try {
    const payload = {
      ...result.data,
      // Normalize date to ISO UTC to satisfy backend expectations
      date: toIsoUtc(result.data.date) || result.data.date,
    }
    const res = await fetch(`${API_BASE_URL}/api/attendance`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json();
      return {
        errors: { _form: [error.message || "Failed to create attendance"] },
      };
    }

    revalidateEntityMutation("ATTENDANCE");
    return { success: true };
  } catch {
    return { errors: { _form: ["Network error"] } };
  }
}

export async function updateAttendanceAction(
  prevState: unknown,
  id: number,
  formData: FormData
): Promise<ActionResult> {
  const cookieHeader = await getAuthCookieHeader();

  const rawData = {
    status: (formData.get("status") as string) || undefined,
    clock_in: (formData.get("clock_in") as string) || undefined,
    clock_out: (formData.get("clock_out") as string) || undefined,
    justification: (formData.get("justification") as string) || undefined,
  };

  try {
    const res = await fetch(`${API_BASE_URL}/api/attendance/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      body: JSON.stringify(rawData),
    });

    if (!res.ok) {
      const error = await res.json();
      return {
        errors: { _form: [error.message || "Failed to update attendance"] },
      };
    }

    revalidateEntityMutation("ATTENDANCE");
    return { success: true };
  } catch {
    return { errors: { _form: ["Network error"] } };
  }
}

export async function deleteAttendanceAction(
  id: string
): Promise<ActionResult> {
  const cookieHeader = await getAuthCookieHeader();

  try {
    const res = await fetch(`${API_BASE_URL}/api/attendance/${id}`, {
      method: "DELETE",
      headers: {
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      return {
        errors: { _form: [error.message || "Failed to delete attendance"] },
      };
    }

    revalidateEntityMutation("ATTENDANCE");
    return { success: true };
  } catch {
    return { errors: { _form: ["Network error"] } };
  }
}

export async function approveJustificationAction(
  justificationId: string
): Promise<ActionResult> {
  const cookieHeader = await getAuthCookieHeader();

  try {
    const res = await fetch(
      `${API_BASE_URL}/api/attendance/justifications/${justificationId}/approve`,
      {
        method: "POST",
        headers: {
          ...(cookieHeader && { Cookie: cookieHeader }),
        },
      }
    );

    if (!res.ok) {
      const error = await res.json();
      return {
        errors: { _form: [error.message || "Failed to approve justification"] },
      };
    }

    revalidateEntityMutation("ATTENDANCE");
    return { success: true };
  } catch {
    return { errors: { _form: ["Network error"] } };
  }
}

export async function rejectJustificationAction(
  justificationId: string
): Promise<ActionResult> {
  const cookieHeader = await getAuthCookieHeader();

  try {
    const res = await fetch(
      `${API_BASE_URL}/api/attendance/justifications/${justificationId}/reject`,
      {
        method: "POST",
        headers: {
          ...(cookieHeader && { Cookie: cookieHeader }),
        },
      }
    );

    if (!res.ok) {
      const error = await res.json();
      return {
        errors: { _form: [error.message || "Failed to reject justification"] },
      };
    }

    revalidateEntityMutation("ATTENDANCE");
    return { success: true };
  } catch {
    return { errors: { _form: ["Network error"] } };
  }
}

export async function exportAttendanceCSV(month: string, userId?: string): Promise<Blob | null> {
  const cookieHeader = await getAuthCookieHeader();

  try {
    const params = new URLSearchParams({ month });
    if (userId) params.append('userId', userId);
    
    const res = await fetch(
      `${API_BASE_URL}/api/attendance/export?${params.toString()}`,
      {
        headers: {
          ...(cookieHeader && { Cookie: cookieHeader }),
        },
      }
    );

    if (!res.ok) return null;
    return await res.blob();
  } catch {
    return null;
  }
}
