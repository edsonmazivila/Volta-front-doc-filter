'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToastHelpers } from '@/components/ui/toast'
import { createLeaveRequestAction, updateLeaveRequestAction } from '@/lib/services/leaves'
import type { LeaveRequestItem } from '@/lib/services/leaves'
import { useLingui } from '@lingui/react'
import { msg } from '@lingui/core/macro'

interface LeaveRequestFormDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	editItem?: LeaveRequestItem | null
	mode?: 'create' | 'edit'
}

const LEAVE_TYPES = [
	'vacation',
	'sick',
	'personal',
	'maternity',
	'paternity',
	'bereavement',
	'emergency'
] as const

export function LeaveRequestFormDialog({
	open,
	onOpenChange,
	editItem = null,
	mode = 'create'
}: LeaveRequestFormDialogProps) {
	const router = useRouter()
	const toast = useToastHelpers()
	const { i18n } = useLingui()
	const isEditMode = mode === 'edit' && editItem

	const [leaveType, setLeaveType] = useState(editItem?.leave_type || 'vacation')
	const [startDate, setStartDate] = useState(editItem?.start_date?.slice(0, 10) || '')
	const [endDate, setEndDate] = useState(editItem?.end_date?.slice(0, 10) || '')
	const [reason, setReason] = useState(editItem?.reason || '')
	const [isHalfDay, setIsHalfDay] = useState(editItem?.is_half_day || false)
	const [isSubmitting, setIsSubmitting] = useState(false)

	useEffect(() => {
		if (!open) return

		if (isEditMode && editItem) {
			setLeaveType(editItem.leave_type || 'vacation')
			setStartDate(editItem.start_date ? new Date(editItem.start_date).toISOString().slice(0, 10) : '')
			setEndDate(editItem.end_date ? new Date(editItem.end_date).toISOString().slice(0, 10) : '')
			setReason(editItem.reason || '')
			setIsHalfDay(Boolean(editItem.is_half_day))
		} else if (!isEditMode) {
			setLeaveType('vacation')
			setStartDate('')
			setEndDate('')
			setReason('')
			setIsHalfDay(false)
		}
	}, [open, isEditMode, editItem])

	const resetForm = () => {
		setLeaveType('vacation')
		setStartDate('')
		setEndDate('')
		setReason('')
		setIsHalfDay(false)
	}

	const handleClose = () => {
		resetForm()
		onOpenChange(false)
	}

	const validateForm = (): boolean => {
		if (!leaveType || !startDate || !endDate) {
			toast.error(i18n._(msg`Type, start and end dates are required`))
			return false
		}

		if (new Date(startDate) > new Date(endDate)) {
			toast.error(i18n._(msg`End date must be after start date`))
			return false
		}

		return true
	}

	const handleSubmit = async () => {
		if (!validateForm()) return

		setIsSubmitting(true)
		try {
			const form = new FormData()
			form.append('leave_type', leaveType)
			form.append('start_date', `${startDate}T00:00:00Z`)
			form.append('end_date', `${endDate}T23:59:59Z`)
			if (reason.trim()) {
				form.append('reason', reason.trim())
			}
			form.append('is_half_day', isHalfDay ? 'true' : 'false')

			let result
			if (isEditMode) {
				result = await updateLeaveRequestAction(editItem.id, null, form)
			} else {
				result = await createLeaveRequestAction(null, form)
			}

			if ('errors' in result) {
				const errs = result.errors as Record<string, string[]>
				const errorMsg = errs._form?.[0] || Object.values(errs)[0]?.[0] || i18n._(msg`Failed to save request`)
				toast.error(errorMsg)
				return
			}

			toast.success(isEditMode ? i18n._(msg`Leave request updated`) : i18n._(msg`Leave request created`))
			handleClose()
			router.refresh()
		} catch (error) {
			console.error('[LeaveRequestForm] Error:', error)
			toast.error(i18n._(msg`Failed to save request`))
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{isEditMode ? i18n._(msg`Edit Leave Request`) : i18n._(msg`New Leave Request`)}
					</DialogTitle>
				</DialogHeader>
				<div className='grid gap-3'>
					{/* Leave Type */}
					<div className='flex flex-col gap-1'>
						<label className='text-sm font-medium'>{i18n._(msg`Type`)}</label>
						<Select value={leaveType} onValueChange={setLeaveType}>
							<SelectTrigger className='w-full bg-background border border-[var(--border)]'>
								<SelectValue placeholder={i18n._(msg`Select type`)} />
							</SelectTrigger>
							<SelectContent className='bg-background border border-[var(--border)]'>
								{LEAVE_TYPES.map(type => (
									<SelectItem key={type} value={type}>
										{type.charAt(0).toUpperCase() + type.slice(1)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Date Range */}
					<div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
						<div className='flex flex-col gap-1'>
							<label className='text-sm font-medium'>{i18n._(msg`Start date`)}</label>
							<input
								type='date'
								className='w-full border rounded-md px-3 py-2 bg-background'
								value={startDate}
								onChange={(e) => setStartDate(e.target.value)}
							/>
						</div>
						<div className='flex flex-col gap-1'>
							<label className='text-sm font-medium'>{i18n._(msg`End date`)}</label>
							<input
								type='date'
								className='w-full border rounded-md px-3 py-2 bg-background'
								value={endDate}
								onChange={(e) => setEndDate(e.target.value)}
							/>
						</div>
					</div>

					{/* Half Day Checkbox */}
					<div className='flex items-center gap-2'>
						<input
							id='half-day'
							type='checkbox'
							checked={isHalfDay}
							onChange={(e) => setIsHalfDay(e.target.checked)}
							className='h-4 w-4'
						/>
						<label htmlFor='half-day' className='text-sm'>
							{i18n._(msg`Half day`)}
						</label>
					</div>

					{/* Reason */}
					<div className='flex flex-col gap-1'>
						<label className='text-sm font-medium'>{i18n._(msg`Reason`)}</label>
						<textarea
							className='w-full border rounded-md px-3 py-2 bg-background'
							rows={3}
							value={reason}
							onChange={(e) => setReason(e.target.value)}
							placeholder={i18n._(msg`Enter reason for leave request...`)}
						/>
					</div>

					{/* Actions */}
					<div className='flex justify-end gap-2 pt-2'>
						<Button
							variant='secondary'
							onClick={handleClose}
							disabled={isSubmitting}
						>
							{i18n._(msg`Cancel`)}
						</Button>
						<Button
							onClick={handleSubmit}
							disabled={isSubmitting}
						>
							{isSubmitting ? i18n._(msg`Saving...`) : isEditMode ? i18n._(msg`Save`) : i18n._(msg`Create`)}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
