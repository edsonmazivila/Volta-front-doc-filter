"use client"

import { type User } from '@/lib/services/users'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface DeleteEmployeeDialogProps {
	employee: User
	open: boolean
	onOpenChange: (open: boolean) => void
	onConfirm: () => void
	isSubmitting: boolean
}

export function DeleteEmployeeDialog({
	employee,
	open,
	onOpenChange,
	onConfirm,
	isSubmitting
}: DeleteEmployeeDialogProps) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
				<AlertDialogDescription>
					This will permanently delete{' '}
					<span className="font-semibold text-foreground">
						{employee.full_name}
					</span>{' '}
					from the system. This action cannot be undone.
				</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isSubmitting}>
						Cancel
					</AlertDialogCancel>
					<AlertDialogAction
						onClick={(e) => {
							e.preventDefault()
							onConfirm()
						}}
						disabled={isSubmitting}
						className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
					>
						{isSubmitting ? 'Deleting...' : 'Delete Employee'}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
