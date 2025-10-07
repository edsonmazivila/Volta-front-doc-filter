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

// Get attendance records with optional filters
export const getAttendanceRecords = cache(
  async (filters?: AttendanceFilters): Promise<AttendanceRecord[]> => {
    return fetchWithGracefulFallback(
      async () => {
        const authHeader = await getAuthCookieHeader();

        const params = new URLSearchParams();
        if (filters?.month) params.append("month", filters.month);
        if (filters?.employee_id)
          params.append("employee_id", filters.employee_id.toString());
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
        return data.data || [];
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

// Get pending justifications
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
        return data.data || [];
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
        const res = await fetch(`${API_BASE_URL}/api/attendance/my${params}`, {
          headers: {
            "Content-Type": "application/json",
            ...(authHeader && { Cookie: authHeader }),
          },
          next: { tags: [CacheTags.MY_ATTENDANCE], revalidate: 30 },
        });

        if (!res.ok) throw new Error("Failed to fetch my attendance");
        const data = await res.json();
        return data.data || [];
      },
      [],
      { errorContext: "getMyAttendance" }
    );
  }
);

// Server Actions
const attendanceSchema = z.object({
  employee_id: z.number().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(["present", "absent", "late", "half_day", "on_leave"]),
  clock_in: z.string().optional(),
  clock_out: z.string().optional(),
  justification: z.string().optional(),
});

export type ActionResult =
  | { success: true; data?: unknown }
  | { errors: { _form?: string[]; [key: string]: string[] | undefined } };

export async function createAttendanceAction(
  prevState: unknown,
  formData: FormData
): Promise<ActionResult> {
  const cookieHeader = await getAuthCookieHeader();

  const rawData = {
    employee_id: Number(formData.get("employee_id")),
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
    const res = await fetch(`${API_BASE_URL}/api/attendance`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      body: JSON.stringify(result.data),
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
  id: number
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
  justificationId: number
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
  justificationId: number
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

export async function exportAttendanceCSV(month: string): Promise<Blob | null> {
  const cookieHeader = await getAuthCookieHeader();

  try {
    const res = await fetch(
      `${API_BASE_URL}/api/attendance/export?month=${month}`,
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
