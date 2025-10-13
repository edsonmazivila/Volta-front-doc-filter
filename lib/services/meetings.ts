"use server";
import { cache } from "react";
import { getAuthCookieHeader } from "@/lib/auth/server-utils";
import { API_BASE_URL } from "@/lib/config";
import { z } from "zod";
import { revalidateEntityMutation, CacheTags } from "@/lib/cache-utils";
import type { Meeting, ActionResult } from "@/lib/types/meetings";

// Type definitions for API responses
interface ApiUserResponse {
  id: string | number;
  first_name?: string;
  last_name?: string;
  email?: string;
}

interface ApiEmployeeResponse {
  id: string | number;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

interface ApiMeetingResponse {
  id: string;
  title: string;
  description?: string;
  datetime: string;
  location?: string;
  status: string;
  organizer_id: string;
  organizer_full_name?: string;
  participants?: string[];
  participants_ids?: string[];
  participant_full_names?: string[];
  created_at?: string;
  updated_at?: string;
}

interface UserMapEntry {
  name: string;
  email: string;
}

// Validation schemas
const createMeetingSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  datetime: z.string().min(1, "Date and time are required"),
  location: z.string().optional(),
  participants_ids: z.array(z.string()).optional(),
});

// Helper function to enrich meetings with user/employee data
async function enrichMeetingsWithEmployeeData(meetings: ApiMeetingResponse[]): Promise<Meeting[]> {
  try {
    const cookieHeader = await getAuthCookieHeader();
    
    // Fetch both users and employees to cover all possible ID mappings
    const [usersRes, employeesRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/users`, {
        headers: {
          "Content-Type": "application/json",
          ...(cookieHeader && { Cookie: cookieHeader }),
        },
        next: { tags: ["users"], revalidate: 300 },
      }),
      fetch(`${API_BASE_URL}/api/employees`, {
        headers: {
          "Content-Type": "application/json",
          ...(cookieHeader && { Cookie: cookieHeader }),
        },
        next: { tags: ["employees"], revalidate: 300 },
      })
    ]);

    // Create a combined map of all user/employee IDs to names
    const userMap = new Map<string, UserMapEntry>();
    
    // Add users to the map
    if (usersRes.ok) {
      const usersData = await usersRes.json();
      const users = Array.isArray(usersData) ? usersData : (usersData.users || usersData.data || []);
      users.forEach((user: ApiUserResponse) => {
        const userId = String(user.id);
        const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
        userMap.set(userId, {
          name: userName,
          email: user.email || '',
        });
      });
    }
    
    // Add employees to the map (may overlap with users)
    if (employeesRes.ok) {
      const employeesData = await employeesRes.json();
      const employees = Array.isArray(employeesData) ? employeesData : (employeesData.employees || employeesData.data || []);
      employees.forEach((emp: ApiEmployeeResponse) => {
        const empId = String(emp.id);
        const empName = emp.full_name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim();
        userMap.set(empId, {
          name: empName,
          email: emp.email || '',
        });
      });
    }

    // Enrich meetings with organizer/participants
    // We fetch individual meeting details to get latest fields like participant_full_names
    const enrichedMeetings = await Promise.all(
      meetings.map(async (meeting: ApiMeetingResponse) => {
        // Fetch full meeting details to get participants
        let fullMeeting: ApiMeetingResponse = meeting;
        try {
          const meetingRes = await fetch(`${API_BASE_URL}/api/meetings/${meeting.id}`, {
            headers: {
              "Content-Type": "application/json",
              ...(cookieHeader && { Cookie: cookieHeader }),
            },
            next: { tags: [CacheTags.MEETINGS], revalidate: 60 },
          });
          
          if (meetingRes.ok) {
            const meetingData = await meetingRes.json();
            fullMeeting = meetingData.meeting || meetingData;
          }
        } catch (error) {
          console.warn('Failed to fetch full meeting details for:', meeting.id, error);
        }
        
        // Participants: accept ids from either `participants` or `participants_ids` and prefer names from API
        let enrichedParticipants: Array<{ user_id: string; name: string; status: 'pending' }> = [];
        const participantIdsFromApi = Array.isArray(fullMeeting.participants)
          ? fullMeeting.participants
          : Array.isArray(fullMeeting.participants_ids)
            ? fullMeeting.participants_ids
            : [];
        if (participantIdsFromApi.length > 0) {
          const names = Array.isArray(fullMeeting.participant_full_names) ? fullMeeting.participant_full_names : [];
          enrichedParticipants = participantIdsFromApi.map((userId: string, idx: number) => {
            const apiName = names[idx];
            const mapped = userMap.get(String(userId));
            return {
              user_id: userId,
              name: apiName || mapped?.name || 'Unknown',
              status: 'pending' as const,
            };
          });
        }

        // Organizer name: prefer API field if present
        const organizerName = fullMeeting.organizer_full_name || userMap.get(meeting.organizer_id)?.name || 'Unknown';

        return {
          ...meeting,
          ...fullMeeting, // Include any additional fields from full meeting details
          status: fullMeeting.status as 'scheduled' | 'cancelled' | 'completed',
          organizer_name: organizerName,
          participants: enrichedParticipants,
        } as Meeting;
      })
    );

    return enrichedMeetings;
  } catch (error) {
    console.error("Error enriching meetings with user/employee data:", error);
    return meetings.map(meeting => ({
      ...meeting,
      status: meeting.status as 'scheduled' | 'cancelled' | 'completed',
      organizer_name: 'Unknown',
      participants: [],
    } as Meeting));
  }
}

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
      const meetings = Array.isArray(data) ? data : (data?.meetings || []);
      
      // Enrich meetings with organizer names and participant data
      return await enrichMeetingsWithEmployeeData(meetings);
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
    const meetings = Array.isArray(data) ? data : (data?.meetings || []);
    
    // Enrich meetings with organizer names and participant data
    return await enrichMeetingsWithEmployeeData(meetings);
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
      const meeting = data?.meeting || data;
      if (!meeting) return null;
      
      // Enrich single meeting with employee data
      const enrichedMeetings = await enrichMeetingsWithEmployeeData([meeting]);
      return enrichedMeetings[0] || null;
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
        // If users endpoint fails (403 for employees), try employees endpoint
        console.log("Users endpoint failed, trying employees endpoint...");
        const empRes = await fetch(`${API_BASE_URL}/api/employees`, {
          headers: {
            "Content-Type": "application/json",
            ...(cookieHeader && { Cookie: cookieHeader }),
          },
          next: { tags: ["employees"], revalidate: 300 },
        });

        if (!empRes.ok) {
          console.warn("Both users and employees endpoints failed, returning empty participants list");
          return [];
        }

        const empData = await empRes.json();
        const employees = Array.isArray(empData) ? empData : (empData.employees || empData.data || []);
        
        // Map employees to participant format
        return employees.map((emp: ApiEmployeeResponse) => ({
          id: String(emp.id || ''),
          name: emp.full_name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || emp.email || emp.id,
          email: emp.email || '',
        }));
      }

      const data = await res.json();
      const users = Array.isArray(data) ? data : (data.users || data.data || []);
      
      // Map users to participant format
      return users.map((user: ApiUserResponse) => ({
        id: String(user.id || ''),
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        email: user.email || '',
      }));
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
      .getAll("participants_ids")
      .filter(Boolean) as string[];

    const rawData = {
      title: formData.get("title"),
      description: formData.get("description") || "",
      datetime: formData.get("datetime"),
      location: formData.get("location") || "",
      participants_ids: participantIds,
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
      .getAll("participants_ids")
      .filter(Boolean) as string[];

    const rawData = {
      title: formData.get("title"),
      description: formData.get("description") || "",
      datetime: formData.get("datetime"),
      location: formData.get("location") || "",
      participants_ids: participantIds,
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
