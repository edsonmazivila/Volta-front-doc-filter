"use client"

import { useState, useEffect } from 'react'
import { type Employee } from '@/lib/services/employees'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui'

interface EditEmployeeDialogProps {
	employee: Employee
	open: boolean
	onOpenChange: (open: boolean) => void
	onSave: (updates: Partial<Employee>) => void
	isSubmitting: boolean
}

export function EditEmployeeDialog({
	employee,
	open,
	onOpenChange,
	onSave,
	isSubmitting
}: EditEmployeeDialogProps) {
	const [formData, setFormData] = useState({
		first_name: employee.first_name,
		last_name: employee.last_name,
		email: employee.email,
		department: employee.department || '',
		is_active: employee.is_active
	})

	// Reset form when employee changes
	useEffect(() => {
		setFormData({
			first_name: employee.first_name,
			last_name: employee.last_name,
			email: employee.email,
			department: employee.department || '',
			is_active: employee.is_active
		})
	}, [employee])

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		onSave(formData)
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Edit Employee</DialogTitle>
					<DialogDescription>
						Update employee information. Click save when you&apos;re done.
					</DialogDescription>
				</DialogHeader>
				
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<label htmlFor="first_name" className="text-sm font-medium">
								First Name <span className="text-red-400">*</span>
							</label>
							<input
								id="first_name"
								type="text"
								required
								value={formData.first_name}
								onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
								className="w-full px-3 py-2 rounded-md border border-[var(--border)] bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>
						
						<div className="space-y-2">
							<label htmlFor="last_name" className="text-sm font-medium">
								Last Name <span className="text-red-400">*</span>
							</label>
							<input
								id="last_name"
								type="text"
								required
								value={formData.last_name}
								onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
								className="w-full px-3 py-2 rounded-md border border-[var(--border)] bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>
					</div>

					<div className="space-y-2">
						<label htmlFor="email" className="text-sm font-medium">
							Email <span className="text-red-400">*</span>
						</label>
						<input
							id="email"
							type="email"
							required
							value={formData.email}
							onChange={(e) => setFormData({ ...formData, email: e.target.value })}
							className="w-full px-3 py-2 rounded-md border border-[var(--border)] bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					<div className="space-y-2">
						<label htmlFor="department" className="text-sm font-medium">
							Department
						</label>
						<input
							id="department"
							type="text"
							value={formData.department}
							onChange={(e) => setFormData({ ...formData, department: e.target.value })}
							className="w-full px-3 py-2 rounded-md border border-[var(--border)] bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					<div className="flex items-center space-x-2">
						<input
							id="is_active"
							type="checkbox"
							checked={formData.is_active}
							onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
							className="h-4 w-4 rounded border-[var(--border)] text-blue-600 focus:ring-2 focus:ring-blue-500"
						/>
						<label htmlFor="is_active" className="text-sm font-medium">
							Active Employee
						</label>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isSubmitting}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={isSubmitting}
						>
							{isSubmitting ? 'Saving...' : 'Save Changes'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
