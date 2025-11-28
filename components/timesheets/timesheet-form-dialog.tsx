'use client'
import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { User } from '@/lib/services/users'
import { useLingui } from '@lingui/react'
import { msg } from '@lingui/core/macro'

interface TimesheetFormDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	defaultValues?: Partial<TimesheetFormValues>
	onSubmit: (values: TimesheetFormValues) => Promise<void>
	title?: string
	submitLabel?: string
	isLoading?: boolean
	employees?: User[]
}

export function TimesheetFormDialog({
	open,
	onOpenChange,
	defaultValues,
	onSubmit,
	title = 'New Timesheet',
	submitLabel = 'Save',
	isLoading = false,
	employees = []
}: TimesheetFormDialogProps) {
	const { i18n } = useLingui()

	const schema = z.object({
		employee_id: z.string().min(1, i18n._(msg`Employee is required`)),
		periodStart: z.string().min(1, i18n._(msg`Period start is required`)),
		periodEnd: z.string().min(1, i18n._(msg`Period end is required`)),
		regularHours: z.coerce.number().min(0, i18n._(msg`Must be >= 0`)),
		overtimeHours: z.coerce.number().min(0, i18n._(msg`Must be >= 0`)),
		status: z.enum(['draft', 'submitted', 'approved', 'rejected'], { required_error: i18n._(msg`Status is required`) }),
		notes: z.string().optional(),
	})

	type TimesheetFormValues = z.infer<typeof schema>
	const { register, handleSubmit, formState: { errors, isSubmitting }, reset, control, watch } = useForm<TimesheetFormValues>({
		resolver: zodResolver(schema),
		defaultValues: {
			employee_id: '',
			periodStart: '',
			periodEnd: '',
			regularHours: 0,
			overtimeHours: 0,
			status: 'draft',
			notes: '',
			...defaultValues,
		},
	})

	const regularHours = watch('regularHours')
	const overtimeHours = watch('overtimeHours')
	const totalHours = (regularHours || 0) + (overtimeHours || 0)

	useEffect(() => {
		if (defaultValues) {
			reset({
				employee_id: defaultValues.employee_id ?? '',
				periodStart: defaultValues.periodStart ?? '',
				periodEnd: defaultValues.periodEnd ?? '',
				regularHours: defaultValues.regularHours ?? 0,
				overtimeHours: defaultValues.overtimeHours ?? 0,
				status: defaultValues.status ?? 'draft',
				notes: defaultValues.notes ?? '',
			})
		}
	}, [defaultValues, reset])

	useEffect(() => {
		if (open && !defaultValues) {
			reset({ 
				employee_id: '',
				periodStart: '', 
				periodEnd: '', 
				regularHours: 0, 
				overtimeHours: 0,
				status: 'draft',
				notes: '' 
			})
		}
	}, [open, defaultValues, reset])

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{i18n._(msg`Fill in the timesheet details for the selected employee.`)}</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit(async (values) => {
					await onSubmit(values)
					onOpenChange(false)
				})} className='space-y-4'>
					{/* Employee Selection */}
					<div className='flex flex-col gap-1'>
						<label className='text-sm font-medium'>{i18n._(msg`Employee`)} *</label>
						<Controller
							name="employee_id"
							control={control}
							render={({ field }) => (
								<Select value={field.value} onValueChange={field.onChange} disabled={isLoading || !!defaultValues?.employee_id}>
									<SelectTrigger className="w-full bg-background border-[var(--border)]">
										<SelectValue placeholder={i18n._(msg`Select employee`)} />
									</SelectTrigger>
									<SelectContent className="bg-background border-[var(--border)]">
											{employees.length === 0 ? (
											<SelectItem value="none" disabled>{i18n._(msg`No employees found`)}</SelectItem>
										) : (
											employees.map((emp) => (
												<SelectItem key={emp.id} value={emp.id}>
														{emp.full_name || emp.email} - {emp.email}
												</SelectItem>
											))
										)}
									</SelectContent>
								</Select>
							)}
						/>
						{errors.employee_id ? <span className='text-xs text-destructive'>{errors.employee_id.message}</span> : null}
					</div>

					{/* Period Dates */}
					<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
						<div className='flex flex-col gap-1'>
							<label className='text-sm font-medium'>{i18n._(msg`Pay Period Start`)} *</label>
							<input type='date' className='w-full border rounded-md px-3 py-2 bg-background' disabled={isLoading} {...register('periodStart')} />
							{errors.periodStart ? <span className='text-xs text-destructive'>{errors.periodStart.message}</span> : null}
						</div>
						<div className='flex flex-col gap-1'>
							<label className='text-sm font-medium'>{i18n._(msg`Pay Period End`)} *</label>
							<input type='date' className='w-full border rounded-md px-3 py-2 bg-background' disabled={isLoading} {...register('periodEnd')} />
							{errors.periodEnd ? <span className='text-xs text-destructive'>{errors.periodEnd.message}</span> : null}
						</div>
					</div>

					{/* Hours */}
					<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
						<div className='flex flex-col gap-1'>
							<label className='text-sm font-medium'>{i18n._(msg`Regular Hours`)} *</label>
							<input
								type='number'
								step='0.5'
								min='0'
								className='w-full border rounded-md px-3 py-2 bg-background'
								disabled={isLoading}
								{...register('regularHours', { valueAsNumber: true })}
							/>
							{errors.regularHours ? <span className='text-xs text-destructive'>{errors.regularHours.message}</span> : null}
						</div>
						<div className='flex flex-col gap-1'>
							<label className='text-sm font-medium'>{i18n._(msg`Overtime Hours`)} *</label>
							<input
								type='number'
								step='0.5'
								min='0'
								className='w-full border rounded-md px-3 py-2 bg-background'
								disabled={isLoading}
								{...register('overtimeHours', { valueAsNumber: true })}
							/>
							{errors.overtimeHours ? <span className='text-xs text-destructive'>{errors.overtimeHours.message}</span> : null}
						</div>
					</div>

					{/* Total Hours Display */}
					<div className='flex flex-col gap-1'>
						<label className='text-sm font-medium text-muted-foreground'>{i18n._(msg`Total Hours`)}</label>
						<div className='w-full border rounded-md px-3 py-2 bg-muted/20 text-lg font-semibold'>
							{totalHours.toFixed(2)} {i18n._(msg`hours`)}
						</div>
					</div>

					{/* Status */}
					<div className='flex flex-col gap-1'>
						<label className='text-sm font-medium'>{i18n._(msg`Status`)} *</label>
						<Controller
							name="status"
							control={control}
							render={({ field }) => (
								<Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
									<SelectTrigger className="w-full bg-background border-[var(--border)]">
										<SelectValue placeholder={i18n._(msg`Select status`)} />
									</SelectTrigger>
									<SelectContent className="bg-background border-[var(--border)]">
										<SelectItem value="draft">{i18n._(msg`Draft`)}</SelectItem>
										<SelectItem value="submitted">{i18n._(msg`Submitted`)}</SelectItem>
										<SelectItem value="approved">{i18n._(msg`Approved`)}</SelectItem>
										<SelectItem value="rejected">{i18n._(msg`Rejected`)}</SelectItem>
									</SelectContent>
								</Select>
							)}
						/>
						{errors.status ? <span className='text-xs text-destructive'>{errors.status.message}</span> : null}
					</div>

					{/* Notes */}
					<div className='flex flex-col gap-1'>
						<label className='text-sm font-medium'>{i18n._(msg`Notes`)}</label>
						<textarea className='w-full border rounded-md px-3 py-2 bg-background' rows={3} disabled={isLoading} {...register('notes')} />
					</div>

					<div className='flex justify-end gap-2 pt-2'>
						<Button type='button' variant='secondary' onClick={() => onOpenChange(false)} disabled={isSubmitting || isLoading}>{i18n._(msg`Cancel`)}</Button>
						<Button type='submit' disabled={isSubmitting || isLoading}>{(isSubmitting || isLoading) ? i18n._(msg`Saving…`) : submitLabel}</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	)
}
