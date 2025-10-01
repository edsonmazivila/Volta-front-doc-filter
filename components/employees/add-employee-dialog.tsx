"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui'

interface AddEmployeeDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	onSave: (data: { first_name: string; last_name: string; email: string; department?: string }) => void
	isSubmitting: boolean
}

export function AddEmployeeDialog({ open, onOpenChange, onSave, isSubmitting }: AddEmployeeDialogProps) {
	const [formData, setFormData] = useState({
		first_name: '',
		last_name: '',
		email: '',
		department: ''
	})

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		onSave(formData)
	}

	const handleClose = () => {
		setFormData({ first_name: '', last_name: '', email: '', department: '' })
		onOpenChange(false)
	}

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Add New Employee</DialogTitle>
					<DialogDescription>
						Create a new employee record. All fields marked with * are required.
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

					<DialogFooter>
						<Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? 'Creating...' : 'Create Employee'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
