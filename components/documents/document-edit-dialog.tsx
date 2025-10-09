'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToastHelpers } from '@/components/ui/toast'
import { patchDocumentAction } from '@/lib/services/documents'

interface DocumentEditDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	documentId: string | null
	initialData: {
		title: string
		description: string
		expiry_date: string
		is_confidential: boolean
	} | null
}

export function DocumentEditDialog({
	open,
	onOpenChange,
	documentId,
	initialData
}: DocumentEditDialogProps) {
	const router = useRouter()
	const toast = useToastHelpers()

	const [title, setTitle] = useState('')
	const [description, setDescription] = useState('')
	const [expiryDate, setExpiryDate] = useState('')
	const [confidential, setConfidential] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)

	// Update form when initialData changes
	useEffect(() => {
		if (initialData) {
			setTitle(initialData.title)
			setDescription(initialData.description)
			setExpiryDate(initialData.expiry_date)
			setConfidential(initialData.is_confidential)
		}
	}, [initialData])

	const handleSave = async () => {
		if (!documentId) return

		setIsSubmitting(true)
		try {
			const form = new FormData()
			form.append('title', title)
			form.append('description', description)
			form.append('expiry_date', expiryDate)
			form.append('is_confidential', String(confidential))

			const result = await patchDocumentAction(documentId, null, form)
			if ('errors' in result) {
				toast.error(result.errors._form?.[0] || 'Failed to update')
			} else {
				toast.success('Updated')
				onOpenChange(false)
				router.refresh()
			}
		} catch {
			toast.error('Failed to update')
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Document</DialogTitle>
				</DialogHeader>
				{initialData ? (
					<div className='grid gap-3'>
						{/* Title */}
						<div className='flex flex-col gap-1'>
							<label className='text-sm font-medium'>Title</label>
							<input
								className='w-full border rounded-md px-3 py-2 bg-background'
								value={title}
								onChange={(e) => setTitle(e.target.value)}
							/>
						</div>

						{/* Description */}
						<div className='flex flex-col gap-1'>
							<label className='text-sm font-medium'>Description</label>
							<textarea
								className='w-full border rounded-md px-3 py-2 bg-background'
								rows={3}
								value={description}
								onChange={(e) => setDescription(e.target.value)}
							/>
						</div>

						{/* Expiry Date */}
						<div className='flex flex-col gap-1'>
							<label className='text-sm font-medium'>Expiry Date</label>
							<input
								type='date'
								className='w-full border rounded-md px-3 py-2 bg-background'
								value={expiryDate}
								onChange={(e) => setExpiryDate(e.target.value)}
							/>
						</div>

						{/* Confidential Checkbox */}
						<div className='flex items-center gap-2'>
							<input
								id='edit-doc-conf'
								type='checkbox'
								checked={confidential}
								onChange={(e) => setConfidential(e.target.checked)}
								className='h-4 w-4'
							/>
							<label htmlFor='edit-doc-conf' className='text-sm'>
								Confidential
							</label>
						</div>

						{/* Actions */}
						<div className='flex justify-end gap-2 pt-2'>
							<Button
								variant='secondary'
								onClick={() => onOpenChange(false)}
								disabled={isSubmitting}
							>
								Cancel
							</Button>
							<Button onClick={handleSave} disabled={isSubmitting}>
								{isSubmitting ? 'Saving...' : 'Save'}
							</Button>
						</div>
					</div>
				) : (
					<div className='text-sm text-muted-foreground'>Loading…</div>
				)}
			</DialogContent>
		</Dialog>
	)
}

