'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui'
import { Textarea } from '@/components/ui/textarea'
import { X } from 'lucide-react'
import type { AttendanceJustification } from '@/lib/types/attendance'
import { useRouter } from 'next/navigation'
import { useLingui } from "@lingui/react"
import { msg } from "@lingui/core/macro"

interface JustificationRejectDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	justification: AttendanceJustification | null
	onReject: (id: string, note: string) => Promise<void>
}

export function JustificationRejectDialog({
	open,
	onOpenChange,
	justification,
	onReject,
}: JustificationRejectDialogProps) {
	const router = useRouter()
	const { i18n } = useLingui()
	const [note, setNote] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)

	const handleReject = async () => {
		if (!justification) return

		if (!note.trim()) {
			return
		}

		setIsSubmitting(true)
		try {
			await onReject(justification.id, note)
			setNote('')
			onOpenChange(false)
			router.refresh()
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleClose = () => {
		if (!isSubmitting) {
			setNote('')
			onOpenChange(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<X className="h-5 w-5 text-red-600 dark:text-red-400" />
						{i18n._(msg`Reject Justification`)}
					</DialogTitle>
					<DialogDescription>
						{i18n._(msg`Please provide a reason for rejecting this justification`)}
					</DialogDescription>
				</DialogHeader>

				{justification && (
					<div className="space-y-4">
						{/* Justification Details */}
						<div className="rounded-lg bg-muted/50 p-4 space-y-2">
							<div className="flex justify-between items-start">
								<div>
									<p className="text-sm font-medium">
										{justification.employee_name || `${i18n._(msg`Employee`)} #${justification.employee_id}`}
									</p>
									<p className="text-xs text-muted-foreground">
										{new Date(justification.date).toLocaleDateString('en-US', {
											weekday: 'long',
											month: 'long',
											day: 'numeric',
											year: 'numeric',
										})}
									</p>
								</div>
							</div>
							<div className="pt-2 border-t border-border">
								<p className="text-xs font-medium text-muted-foreground mb-1">{i18n._(msg`Reason`)}:</p>
								<p className="text-sm">{justification.reason}</p>
							</div>
						</div>

						{/* Rejection Note */}
						<div className="space-y-2">
							<label htmlFor="rejection-note" className="text-sm font-medium">
								{i18n._(msg`Rejection Note`)} <span className="text-red-500">*</span>
							</label>
							<Textarea
								id="rejection-note"
								value={note}
								onChange={(e) => setNote(e.target.value)}
								placeholder={i18n._(msg`E.g., Not a valid medical justification, insufficient evidence...`)}
								rows={4}
								disabled={isSubmitting}
								className="resize-none"
								required
							/>
							<p className="text-xs text-muted-foreground">
								{i18n._(msg`This note will be visible to the employee`)}
							</p>
						</div>

						{/* Action Buttons */}
						<div className="flex items-center gap-2 pt-4 border-t border-border">
							<Button
								type="button"
								variant="outline"
								onClick={handleClose}
								disabled={isSubmitting}
								className="flex-1"
							>
								{i18n._(msg`Cancel`)}
							</Button>
							<Button
								onClick={handleReject}
								disabled={isSubmitting || !note.trim()}
								className="flex-1 bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white"
							>
								{isSubmitting ? i18n._(msg`Rejecting...`) : i18n._(msg`Reject Justification`)}
							</Button>
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	)
}

