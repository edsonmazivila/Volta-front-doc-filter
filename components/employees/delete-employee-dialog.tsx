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
import { useLingui } from "@lingui/react"
import { msg } from "@lingui/core/macro"

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
	const { i18n } = useLingui()

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{i18n._(msg`Are you absolutely sure?`)}</AlertDialogTitle>
				<AlertDialogDescription>
					{i18n._(msg`This will permanently delete`)}
					{' '}
					<span className="font-semibold text-foreground">
						{employee.full_name}
					</span>
					{' '}
					{i18n._(msg`from the system. This action cannot be undone.`)}
				</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isSubmitting}>
						{i18n._(msg`Cancel`)}
					</AlertDialogCancel>
					<AlertDialogAction
						onClick={(e) => {
							e.preventDefault()
							onConfirm()
						}}
						disabled={isSubmitting}
						className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
					>
						{isSubmitting ? i18n._(msg`Deleting...`) : i18n._(msg`Delete Employee`)}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
