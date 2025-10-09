'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToastHelpers } from '@/components/ui/toast'
import { rejectDocumentAction } from '@/lib/services/documents'

interface DocumentRejectDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	documentId: string | null
}

export function DocumentRejectDialog({
	open,
	onOpenChange,
	documentId
}: DocumentRejectDialogProps) {
	const router = useRouter()
	const toast = useToastHelpers()

	const [reason, setReason] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)

	const handleClose = () => {
		setReason('')
		onOpenChange(false)
	}

	const handleReject = async () => {
		if (!documentId || !reason.trim()) {
			toast.error('Reason is required')
			return
		}

		setIsSubmitting(true)
		try {
			const form = new FormData()
			form.append('reason', reason.trim())

			const result = await rejectDocumentAction(documentId, null, form)
			if ('errors' in result) {
				toast.error(result.errors._form?.[0] || 'Failed to reject')
			} else {
				toast.success('Rejected')
				handleClose()
				router.refresh()
			}
		} catch {
			toast.error('Failed to reject')
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Reject Document</DialogTitle>
				</DialogHeader>
				<div className='flex flex-col gap-2'>
					<label className='text-sm font-medium'>Reason</label>
					<textarea
						className='w-full border rounded-md px-3 py-2 bg-background'
						rows={3}
						value={reason}
						onChange={(e) => setReason(e.target.value)}
						placeholder='Enter reason for rejection...'
					/>
				</div>
				<div className='flex justify-end gap-2 pt-2'>
					<Button
						variant='secondary'
						onClick={handleClose}
						disabled={isSubmitting}
					>
						Cancel
					</Button>
					<Button
						variant='destructive'
						onClick={handleReject}
						disabled={isSubmitting || !reason.trim()}
					>
						{isSubmitting ? 'Rejecting...' : 'Reject'}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
}

