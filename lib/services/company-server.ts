"use server";
import { getAuthCookieHeader } from "@/lib/auth/server-utils";
import { API_BASE_URL } from "@/lib/config";
import { handleServiceError } from "@/lib/http/error-handler";

export interface CompanyProfile {
  id: string;
  name: string;
  registration_number?: string;
  tax_number?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  bank_name?: string;
  bank_account?: string;
  bank_iban?: string;
  bank_swift?: string;
}

export interface PaySchedule {
  id: string;
  name: string;
  frequency: "weekly" | "biweekly" | "semimonthly" | "monthly";
  start_date: string;
  is_active: boolean;
}

export interface LeavePolicy {
  id: string;
  name: string;
  leave_type: string;
  annual_allocation_days: number;
}

async function authHeaders() {
  const cookieHeader = await getAuthCookieHeader();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (cookieHeader) headers["Cookie"] = cookieHeader;
  return headers;
}

export async function fetchCompany(): Promise<CompanyProfile | null> {
  try {
    const headers = await authHeaders();
    const base = API_BASE_URL || "";
    const candidates = [`${base}/api/company`];
    let data: any = null;
    for (const url of candidates) {
      try {
        const res = await fetch(url, {
          method: "GET",
          headers,
          cache: "no-store",
        });
        if (!res.ok) continue;
        const json = (await res.json().catch(() => ({}))) as any;
        data = (json.data ?? json) as any;
        if (data && (data.id || data.name || data.company)) break;
      } catch {}
    }
    if (!data) return null;
    if (data.company) data = data.company;
    return {
      id: String(data.id || ""),
      name: String(data.name || ""),
      registration_number: data.registration_number || data.reg_number || "",
      tax_number: data.tax_number || data.nuit || data.vat || "",
      address_line1: data.address_line1 || data.address1 || "",
      address_line2: data.address_line2 || data.address2 || "",
      city: data.city || "",
      state: data.state || data.province || "",
      postal_code: data.postal_code || data.zip || "",
      country: data.country || "",
      bank_name: data.bank_name || "",
      bank_account: data.bank_account || data.account || "",
      bank_iban: data.bank_iban || data.iban || "",
      bank_swift: data.bank_swift || data.swift || "",
    };
  } catch (error) {
    return handleServiceError(error, "fetchCompany", "Failed to load company");
  }
}

export async function fetchPaySchedulesServer(): Promise<PaySchedule[]> {
  try {
    const headers = await authHeaders();
    const base = API_BASE_URL || "";
    const url = `${base}/api/pay-schedules`;
    const res = await fetch(url, { method: "GET", headers, cache: "no-store" });
    if (!res.ok) return [];
    const json = (await res.json().catch(() => ({}))) as any;
    const list: any[] = Array.isArray(json)
      ? json
      : json.data || json.pay_schedules || [];
    return list.map((s) => ({
      id: String(s.id || ""),
      name: String(s.name || ""),
      frequency: (s.frequency || "monthly") as PaySchedule["frequency"],
      start_date: String(s.start_date || s.start || ""),
      is_active: Boolean(s.is_active),
    }));
  } catch (error) {
    return handleServiceError(
      error,
      "fetchPaySchedulesServer",
      "Failed to load pay schedules"
    );
  }
}

export async function fetchLeavePoliciesServer(): Promise<LeavePolicy[]> {
  try {
    const headers = await authHeaders();
    const base = API_BASE_URL || "";
    const url = `${base}/api/leave-policies`;
    const res = await fetch(url, { method: "GET", headers, cache: "no-store" });
    if (!res.ok) return [];
    const json = (await res.json().catch(() => ({}))) as any;
    const list: any[] = Array.isArray(json)
      ? json
      : json.data || json.policies || [];
    return list.map((p) => ({
      id: String(p.id || ""),
      name: String(p.name || ""),
      leave_type: String(p.leave_type || p.type || ""),
      annual_allocation_days:
        Number(p.annual_allocation_days ?? p.allocation_days ?? 0) || 0,
    }));
  } catch (error) {
    return handleServiceError(
      error,
      "fetchLeavePoliciesServer",
      "Failed to load leave policies"
    );
  }
}
