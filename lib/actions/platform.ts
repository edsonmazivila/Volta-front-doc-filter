'use server';

import { revalidatePath } from 'next/cache';
import {
  approveOrganization as approveOrganizationService,
  rejectOrganization as rejectOrganizationService,
  suspendOrganization as suspendOrganizationService,
  reactivateOrganization as reactivateOrganizationService
} from '@/lib/services/platform';

export interface PlatformActionResult {
  success: boolean;
  error?: string;
}

/**
 * Server Action: Approve Organization
 */
export async function approveOrganizationAction(
  organizationId: string,
  data?: { notes?: string; tier?: string }
): Promise<PlatformActionResult> {
  try {
    await approveOrganizationService(organizationId, data as { notes?: string; tier?: 'standard' | 'premium' | 'enterprise' } || {});
    revalidatePath('/platform/organizations');
    revalidatePath('/platform/dashboard');
    return { success: true };
  } catch (error) {
    console.error('[APPROVE_ORGANIZATION_ACTION] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to approve organization'
    };
  }
}

/**
 * Server Action: Reject Organization
 */
export async function rejectOrganizationAction(
  organizationId: string,
  notes: string
): Promise<PlatformActionResult> {
  try {
    await rejectOrganizationService(organizationId, { notes });
    revalidatePath('/platform/organizations');
    revalidatePath('/platform/dashboard');
    return { success: true };
  } catch (error) {
    console.error('[REJECT_ORGANIZATION_ACTION] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reject organization'
    };
  }
}

/**
 * Server Action: Suspend Organization
 */
export async function suspendOrganizationAction(
  organizationId: string,
  notes: string
): Promise<PlatformActionResult> {
  try {
    await suspendOrganizationService(organizationId, { notes });
    revalidatePath('/platform/organizations');
    return { success: true };
  } catch (error) {
    console.error('[SUSPEND_ORGANIZATION_ACTION] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to suspend organization'
    };
  }
}

/**
 * Server Action: Reactivate Organization
 */
export async function reactivateOrganizationAction(
  organizationId: string,
  notes?: string
): Promise<PlatformActionResult> {
  try {
    await reactivateOrganizationService(organizationId, { notes });
    revalidatePath('/platform/organizations');
    revalidatePath(`/platform/organizations/${organizationId}`);
    return { success: true };
  } catch (error) {
    console.error('[REACTIVATE_ORGANIZATION_ACTION] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reactivate organization'
    };
  }
}
