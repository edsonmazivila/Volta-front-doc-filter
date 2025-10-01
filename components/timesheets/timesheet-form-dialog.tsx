'use client'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

const schema = z.object({
	periodStart: z.string().min(1, 'Required'),
	periodEnd: z.string().min(1, 'Required'),
	totalHours: z.coerce.number().min(0, 'Must be >= 0'),
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
}

export function TimesheetFormDialog({ open, onOpenChange, defaultValues, onSubmit, title = 'New Timesheet', submitLabel = 'Save', isLoading = false }: TimesheetFormDialogProps) {
	const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<TimesheetFormValues>({
		resolver: zodResolver(schema),
		defaultValues: {
			periodStart: '',
			periodEnd: '',
			totalHours: 0,
			notes: '',
			...defaultValues,
		},
	})

	useEffect(() => {
		if (defaultValues) {
			reset({
				periodStart: defaultValues.periodStart ?? '',
				periodEnd: defaultValues.periodEnd ?? '',
				totalHours: defaultValues.totalHours ?? 0,
				notes: defaultValues.notes ?? '',
			})
		}
	}, [defaultValues, reset])

	useEffect(() => {
		if (open && !defaultValues) {
			reset({ periodStart: '', periodEnd: '', totalHours: 0, notes: '' })
		}
	}, [open, defaultValues, reset])

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>Fill in the period and total hours. You can add notes for context.</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit(async (values) => {
					await onSubmit(values)
					onOpenChange(false)
				})} className='space-y-3'>
					<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
						<div className='flex flex-col gap-1'>
							<label className='text-sm font-medium'>Period start</label>
							<input type='date' className='w-full border rounded-md px-3 py-2 bg-background' disabled={isLoading} {...register('periodStart')} />
						{errors.periodStart ? <span className='text-xs text-destructive'>{errors.periodStart.message}</span> : null}
					</div>
						<div className='flex flex-col gap-1'>
							<label className='text-sm font-medium'>Period end</label>
							<input type='date' className='w-full border rounded-md px-3 py-2 bg-background' disabled={isLoading} {...register('periodEnd')} />
						{errors.periodEnd ? <span className='text-xs text-destructive'>{errors.periodEnd.message}</span> : null}
					</div>
				</div>
					<div className='flex flex-col gap-1'>
						<label className='text-sm font-medium'>Total hours</label>
						<input type='number' step='0.01' className='w-full border rounded-md px-3 py-2 bg-background' disabled={isLoading} {...register('totalHours', { valueAsNumber: true })} />
					{errors.totalHours ? <span className='text-xs text-destructive'>{errors.totalHours.message}</span> : null}
				</div>
					<div className='flex flex-col gap-1'>
						<label className='text-sm font-medium'>Notes</label>
						<textarea className='w-full border rounded-md px-3 py-2 bg-background' rows={4} disabled={isLoading} {...register('notes')} />
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


