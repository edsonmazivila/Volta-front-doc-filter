'use server'

/**
 * Platform Owner Actions
 * Server actions for platform-level operations (approve/reject organizations)
 */

import { revalidatePath } from 'next/cache'
import { approveOrganization as approveOrgService, rejectOrganization as rejectOrgService } from '@/lib/services/organizations'
import { OrganizationTier } from '@/lib/types/organization'

export async function approveOrganizationAction(
	organizationId: string, 
	data?: { notes?: string; tier?: OrganizationTier }
): Promise<{ success: boolean; error?: string }> {
	try {
		await approveOrgService(organizationId, data || {})
		revalidatePath('/platform/dashboard')
		revalidatePath('/platform/organizations')
		return { success: true }
	} catch (error) {
		console.error('[ApproveOrgAction] Failed:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to approve organization'
		}
	}
}

export async function rejectOrganizationAction(organizationId: string, reason: string): Promise<{ success: boolean; error?: string }> {
	try {
		await rejectOrgService(organizationId, { notes: reason })
		revalidatePath('/platform/dashboard')
		revalidatePath('/platform/organizations')
		return { success: true }
	} catch (error) {
		console.error('[RejectOrgAction] Failed:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to reject organization'
		}
	}
}
