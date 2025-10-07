'use client'
import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Employee } from '@/lib/services/employees'

const schema = z.object({
	employee_id: z.string().min(1, 'Employee is required'),
	periodStart: z.string().min(1, 'Period start is required'),
	periodEnd: z.string().min(1, 'Period end is required'),
	regularHours: z.coerce.number().min(0, 'Must be >= 0'),
	overtimeHours: z.coerce.number().min(0, 'Must be >= 0'),
	status: z.enum(['draft', 'submitted'], { required_error: 'Status is required' }),
	notes: z.string().optional(),
})

export type TimesheetFormValues = z.infer<typeof schema>

interface TimesheetFormDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	defaultValues?: Partial<TimesheetFormValues>
	onSubmit: (values: TimesheetFormValues) => Promise<void>
	title?: string
	submitLabel?: string
	isLoading?: boolean
	employees?: Employee[]
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
					<DialogDescription>Fill in the timesheet details for the selected employee.</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit(async (values) => {
					await onSubmit(values)
					onOpenChange(false)
				})} className='space-y-4'>
					{/* Employee Selection */}
					<div className='flex flex-col gap-1'>
						<label className='text-sm font-medium'>Employee *</label>
						<Controller
							name="employee_id"
							control={control}
							render={({ field }) => (
								<Select value={field.value} onValueChange={field.onChange} disabled={isLoading || !!defaultValues?.employee_id}>
									<SelectTrigger className="w-full bg-background border-[var(--border)]">
										<SelectValue placeholder="Select employee" />
									</SelectTrigger>
									<SelectContent className="bg-background border-[var(--border)]">
										{employees.length === 0 ? (
											<SelectItem value="" disabled>No employees found</SelectItem>
										) : (
											employees.map((emp) => (
												<SelectItem key={emp.id} value={emp.id}>
													{emp.first_name} {emp.last_name} - {emp.email}
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
							<label className='text-sm font-medium'>Pay Period Start *</label>
							<input type='date' className='w-full border rounded-md px-3 py-2 bg-background' disabled={isLoading} {...register('periodStart')} />
							{errors.periodStart ? <span className='text-xs text-destructive'>{errors.periodStart.message}</span> : null}
						</div>
						<div className='flex flex-col gap-1'>
							<label className='text-sm font-medium'>Pay Period End *</label>
							<input type='date' className='w-full border rounded-md px-3 py-2 bg-background' disabled={isLoading} {...register('periodEnd')} />
							{errors.periodEnd ? <span className='text-xs text-destructive'>{errors.periodEnd.message}</span> : null}
						</div>
					</div>

					{/* Hours */}
					<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
						<div className='flex flex-col gap-1'>
							<label className='text-sm font-medium'>Regular Hours *</label>
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
							<label className='text-sm font-medium'>Overtime Hours *</label>
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
						<label className='text-sm font-medium text-muted-foreground'>Total Hours</label>
						<div className='w-full border rounded-md px-3 py-2 bg-muted/20 text-lg font-semibold'>
							{totalHours.toFixed(2)} hours
						</div>
					</div>

					{/* Status */}
					<div className='flex flex-col gap-1'>
						<label className='text-sm font-medium'>Status *</label>
						<Controller
							name="status"
							control={control}
							render={({ field }) => (
								<Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
									<SelectTrigger className="w-full bg-background border-[var(--border)]">
										<SelectValue placeholder="Select status" />
									</SelectTrigger>
									<SelectContent className="bg-background border-[var(--border)]">
										<SelectItem value="draft">Draft</SelectItem>
										<SelectItem value="submitted">Submitted</SelectItem>
									</SelectContent>
								</Select>
							)}
						/>
						{errors.status ? <span className='text-xs text-destructive'>{errors.status.message}</span> : null}
					</div>

					{/* Notes */}
					<div className='flex flex-col gap-1'>
						<label className='text-sm font-medium'>Notes</label>
						<textarea className='w-full border rounded-md px-3 py-2 bg-background' rows={3} disabled={isLoading} {...register('notes')} />
					</div>

					<div className='flex justify-end gap-2 pt-2'>
						<Button type='button' variant='secondary' onClick={() => onOpenChange(false)} disabled={isSubmitting || isLoading}>Cancel</Button>
						<Button type='submit' disabled={isSubmitting || isLoading}>{(isSubmitting || isLoading) ? 'Saving…' : submitLabel}</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	)
}
