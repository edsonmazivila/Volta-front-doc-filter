"use server";
import { cache } from "react";
import { getAuthCookieHeader } from "@/lib/auth/server-utils";
import { API_BASE_URL } from "@/lib/config";
import { z } from "zod";
import { revalidateEntityMutation, CacheTags } from "@/lib/cache-utils";
import type { Meeting, ActionResult } from "@/lib/types/meetings";

// Validation schemas
const createMeetingSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  datetime: z.string().min(1, "Date and time are required"),
  location: z.string().optional(),
  participant_ids: z.array(z.string()).optional(),
});

// READ operations (cached)
export const getMyMeetings = cache(
  async (params?: { status?: string }): Promise<Meeting[]> => {
    try {
      const qs = new URLSearchParams();
      if (params?.status) qs.append("status", params.status);

      const cookieHeader = await getAuthCookieHeader();
      const res = await fetch(
        `${API_BASE_URL}/api/meetings/my${qs.toString() ? `?${qs}` : ""}`,
        {
          headers: {
            "Content-Type": "application/json",
            ...(cookieHeader && { Cookie: cookieHeader }),
          },
          next: { tags: [CacheTags.MEETINGS], revalidate: 60 },
        }
      );

      if (!res.ok) {
        throw new Error(`Failed to fetch meetings: ${res.status}`);
      }

      const data = await res.json();
      return data?.meetings || [];
    } catch (error) {
      console.error("Error fetching meetings:", error);
      return [];
    }
  }
);

export const getAllMeetings = cache(async (): Promise<Meeting[]> => {
  try {
    const cookieHeader = await getAuthCookieHeader();
    const res = await fetch(`${API_BASE_URL}/api/meetings`, {
      headers: {
        "Content-Type": "application/json",
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      next: { tags: [CacheTags.MEETINGS], revalidate: 60 },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch meetings: ${res.status}`);
    }

    const data = await res.json();
    return data?.meetings || [];
  } catch (error) {
    console.error("Error fetching meetings:", error);
    return [];
  }
});

export const getMeetingById = cache(
  async (id: string): Promise<Meeting | null> => {
    try {
      const cookieHeader = await getAuthCookieHeader();
      const res = await fetch(`${API_BASE_URL}/api/meetings/${id}`, {
        headers: {
          "Content-Type": "application/json",
          ...(cookieHeader && { Cookie: cookieHeader }),
        },
        next: { tags: [CacheTags.MEETINGS], revalidate: 60 },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch meeting: ${res.status}`);
      }

      const data = await res.json();
      return data?.meeting || null;
    } catch (error) {
      console.error("Error fetching meeting:", error);
      return null;
    }
  }
);

// Get list of users for participant selection
export const getAvailableParticipants = cache(
  async (): Promise<Array<{ id: string; name: string; email?: string }>> => {
    try {
      const cookieHeader = await getAuthCookieHeader();
      const res = await fetch(`${API_BASE_URL}/api/users`, {
        headers: {
          "Content-Type": "application/json",
          ...(cookieHeader && { Cookie: cookieHeader }),
        },
        next: { tags: ["users"], revalidate: 300 },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch users: ${res.status}`);
      }

      const data = await res.json();
      return data?.users || [];
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  }
);

// WRITE operations (server actions)
export async function createMeetingAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    // Parse participants
    const participantIds = formData
      .getAll("participant_ids")
      .filter(Boolean) as string[];

    const rawData = {
      title: formData.get("title"),
      description: formData.get("description") || "",
      datetime: formData.get("datetime"),
      location: formData.get("location") || "",
      participant_ids: participantIds,
    };

    const parsed = createMeetingSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        errors: {
          _form: [parsed.error.errors[0]?.message || "Validation failed"],
        },
      };
    }

    const cookieHeader = await getAuthCookieHeader();
    const res = await fetch(`${API_BASE_URL}/api/meetings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      body: JSON.stringify(parsed.data),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        errors: {
          _form: [errorData.error || `Failed to create meeting: ${res.status}`],
        },
      };
    }

    const data = await res.json();
    await revalidateEntityMutation("MEETINGS");
    return { success: true, data };
  } catch {
    return {
      errors: {
        _form: ["An unexpected error occurred"],
      },
    };
  }
}

export async function updateMeetingAction(
  id: string,
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    const participantIds = formData
      .getAll("participant_ids")
      .filter(Boolean) as string[];

    const rawData = {
      title: formData.get("title"),
      description: formData.get("description") || "",
      datetime: formData.get("datetime"),
      location: formData.get("location") || "",
      participant_ids: participantIds,
    };

    const parsed = createMeetingSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        errors: {
          _form: [parsed.error.errors[0]?.message || "Validation failed"],
        },
      };
    }

    const cookieHeader = await getAuthCookieHeader();
    const res = await fetch(`${API_BASE_URL}/api/meetings/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      body: JSON.stringify(parsed.data),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        errors: {
          _form: [errorData.error || `Failed to update meeting: ${res.status}`],
        },
      };
    }

    const data = await res.json();
    await revalidateEntityMutation("MEETINGS");
    return { success: true, data };
  } catch {
    return {
      errors: {
        _form: ["An unexpected error occurred"],
      },
    };
  }
}

export async function deleteMeetingAction(id: string): Promise<ActionResult> {
  try {
    const cookieHeader = await getAuthCookieHeader();
    const res = await fetch(`${API_BASE_URL}/api/meetings/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        errors: {
          _form: [errorData.error || `Failed to delete meeting: ${res.status}`],
        },
      };
    }

    await revalidateEntityMutation("MEETINGS");
    return { success: true };
  } catch {
    return {
      errors: {
        _form: ["An unexpected error occurred"],
      },
    };
  }
}

export async function respondToMeetingAction(
  id: string,
  decision: "accept" | "decline"
): Promise<ActionResult> {
  try {
    const cookieHeader = await getAuthCookieHeader();
    const res = await fetch(`${API_BASE_URL}/api/meetings/${id}/respond`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      body: JSON.stringify({ decision }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        errors: {
          _form: [
            errorData.error || `Failed to respond to meeting: ${res.status}`,
          ],
        },
      };
    }

    await revalidateEntityMutation("MEETINGS");
    return { success: true };
  } catch {
    return {
      errors: {
        _form: ["An unexpected error occurred"],
      },
    };
  }
}
