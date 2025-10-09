"use client"

import { useState, useEffect } from "react"
import { type Employee, type EmployeeDetails, getEmployeeDetails } from "@/lib/services/employees"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Phone, MapPin, User, Building, DollarSign, Users, Loader2 } from "lucide-react"

interface EmployeeViewDialogProps {
	employee: Employee
	trigger?: React.ReactNode
	open?: boolean
	onOpenChange?: (open: boolean) => void
}

export function EmployeeViewDialog({ employee, trigger, open: controlledOpen, onOpenChange }: EmployeeViewDialogProps) {
	const [internalOpen, setInternalOpen] = useState(false)
	const open = controlledOpen !== undefined ? controlledOpen : internalOpen
	const setOpen = onOpenChange || setInternalOpen
	const [employeeDetails, setEmployeeDetails] = useState<EmployeeDetails | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	// Fetch detailed employee information when dialog opens
	useEffect(() => {
		if (open && !employeeDetails) {
			setIsLoading(true)
			setError(null)
			getEmployeeDetails(employee.id)
				.then((details) => {
					setEmployeeDetails(details)
				})
				.catch((err) => {
					setError(err.message || 'Failed to load employee details')
				})
				.finally(() => {
					setIsLoading(false)
				})
		}
	}, [open, employee.id, employeeDetails])

	// Reset state when dialog closes
	useEffect(() => {
		if (!open) {
			setEmployeeDetails(null)
			setError(null)
		}
	}, [open])

	// Format date for display
	const formatDate = (dateString?: string) => {
		if (!dateString) return "Not provided"
		try {
			return new Date(dateString).toLocaleDateString("en-US", {
				year: "numeric",
				month: "long",
				day: "numeric",
			})
		} catch {
			return "Invalid date"
		}
	}

	// Format phone number
	const formatPhone = (phone?: string) => {
		if (!phone) return "Not provided"
		// Simple phone formatting - you can enhance this
		return phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3")
	}


	return (
		<Dialog open={open} onOpenChange={setOpen}>
			{trigger && (
				<DialogTrigger asChild>
					{trigger}
				</DialogTrigger>
			)}
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<User className="h-5 w-5" />
						Employee Details
					</DialogTitle>
				</DialogHeader>

				{isLoading && (
					<div className="flex items-center justify-center py-8">
						<Loader2 className="h-6 w-6 animate-spin" />
						<span className="ml-2">Loading employee details...</span>
					</div>
				)}

				{error && (
					<div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
						<p className="text-red-400 text-sm">{error}</p>
					</div>
				)}

				{!isLoading && !error && employeeDetails && (
					<div className="space-y-6">
					{/* Header Section */}
					<div className="flex items-start justify-between">
						<div>
							<h2 className="text-2xl font-bold text-foreground">
								{employeeDetails.full_name || employee.full_name}
							</h2>
							<p className="text-muted-foreground">
								{employeeDetails.email || employee.email || "No email provided"}
							</p>
							{employeeDetails.employee_number && (
								<p className="text-sm text-muted-foreground">
									Employee #: {employeeDetails.employee_number}
								</p>
							)}
						</div>
						<Badge
							variant={(employeeDetails.is_active ?? employee.is_active) ? "default" : "secondary"}
							className={
								(employeeDetails.is_active ?? employee.is_active)
									? "bg-green-500/20 text-green-400 border-green-500/30"
									: "bg-red-500/20 text-red-400 border-red-500/30"
							}
						>
							{(employeeDetails.is_active ?? employee.is_active) ? "Active" : "Inactive"}
						</Badge>
					</div>

					{/* Basic Information */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="space-y-4">
							<h3 className="text-lg font-semibold flex items-center gap-2">
								<User className="h-4 w-4" />
								Basic Information
							</h3>
							<div className="space-y-3">
								{employeeDetails.phone_primary && (
									<div className="flex items-center gap-3">
										<Phone className="h-4 w-4 text-muted-foreground" />
										<div>
											<p className="text-sm font-medium">Primary Phone</p>
											<p className="text-sm text-muted-foreground">
												{formatPhone(employeeDetails.phone_primary)}
											</p>
										</div>
									</div>
								)}

								{employeeDetails.secondary_phone && (
									<div className="flex items-center gap-3">
										<Phone className="h-4 w-4 text-muted-foreground" />
										<div>
											<p className="text-sm font-medium">Secondary Phone</p>
											<p className="text-sm text-muted-foreground">
												{formatPhone(employeeDetails.secondary_phone)}
											</p>
										</div>
									</div>
								)}

								{employeeDetails.job_title && (
									<div className="flex items-center gap-3">
										<Building className="h-4 w-4 text-muted-foreground" />
										<div>
											<p className="text-sm font-medium">Job Title</p>
											<p className="text-sm text-muted-foreground">{employeeDetails.job_title}</p>
										</div>
									</div>
								)}

								{employeeDetails.department && (
									<div className="flex items-center gap-3">
										<Building className="h-4 w-4 text-muted-foreground" />
										<div>
											<p className="text-sm font-medium">Department</p>
											<p className="text-sm text-muted-foreground">{employeeDetails.department}</p>
										</div>
									</div>
								)}

								{employeeDetails.role && (
									<div className="flex items-center gap-3">
										<User className="h-4 w-4 text-muted-foreground" />
										<div>
											<p className="text-sm font-medium">Role</p>
											<p className="text-sm text-muted-foreground">{employeeDetails.role}</p>
										</div>
									</div>
								)}
							</div>
						</div>

						<div className="space-y-4">
							<h3 className="text-lg font-semibold flex items-center gap-2">
								<CalendarDays className="h-4 w-4" />
								Employment Details
							</h3>
							<div className="space-y-3">
								{employeeDetails.employment_type && (
									<div>
										<p className="text-sm font-medium">Employment Type</p>
										<p className="text-sm text-muted-foreground">{employeeDetails.employment_type}</p>
									</div>
								)}

								{employeeDetails.hire_date && (
									<div>
										<p className="text-sm font-medium">Hire Date</p>
										<p className="text-sm text-muted-foreground">
											{formatDate(employeeDetails.hire_date)}
										</p>
									</div>
								)}

								{employeeDetails.date_of_birth && (
									<div>
										<p className="text-sm font-medium">Date of Birth</p>
										<p className="text-sm text-muted-foreground">
											{formatDate(employeeDetails.date_of_birth)}
										</p>
									</div>
								)}

								{employeeDetails.created_at && (
									<div>
										<p className="text-sm font-medium">Created</p>
										<p className="text-sm text-muted-foreground">
											{formatDate(employeeDetails.created_at)}
										</p>
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Address Information */}
					{(employeeDetails.address_line1 || employeeDetails.city || employeeDetails.state || employeeDetails.postal_code || employeeDetails.country) && (
						<div className="space-y-4">
							<h3 className="text-lg font-semibold flex items-center gap-2">
								<MapPin className="h-4 w-4" />
								Address Information
							</h3>
							<div className="p-4 bg-muted/30 rounded-lg space-y-2">
								{employeeDetails.address_line1 && (
									<p className="text-sm text-muted-foreground">{employeeDetails.address_line1}</p>
								)}
								{employeeDetails.address_line2 && (
									<p className="text-sm text-muted-foreground">{employeeDetails.address_line2}</p>
								)}
								{(employeeDetails.city || employeeDetails.state || employeeDetails.postal_code) && (
									<p className="text-sm text-muted-foreground">
										{[employeeDetails.city, employeeDetails.state, employeeDetails.postal_code]
											.filter(Boolean)
											.join(', ')}
									</p>
								)}
								{employeeDetails.country && (
									<p className="text-sm text-muted-foreground">{employeeDetails.country}</p>
								)}
							</div>
						</div>
					)}

					{/* Emergency Contact */}
					{(employeeDetails.emergency_contact_name || employeeDetails.emergency_contact_phone || employeeDetails.emergency_contact_relationship) && (
						<div className="space-y-4">
							<h3 className="text-lg font-semibold flex items-center gap-2">
								<Users className="h-4 w-4" />
								Emergency Contact
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
								{employeeDetails.emergency_contact_name && (
									<div className="space-y-2">
										<p className="text-sm font-medium">Name</p>
										<p className="text-sm text-muted-foreground">{employeeDetails.emergency_contact_name}</p>
									</div>
								)}
								{employeeDetails.emergency_contact_phone && (
									<div className="space-y-2">
										<p className="text-sm font-medium">Phone</p>
										<p className="text-sm text-muted-foreground">
											{formatPhone(employeeDetails.emergency_contact_phone)}
										</p>
									</div>
								)}
								{employeeDetails.emergency_contact_relationship && (
									<div className="space-y-2">
										<p className="text-sm font-medium">Relationship</p>
										<p className="text-sm text-muted-foreground">{employeeDetails.emergency_contact_relationship}</p>
									</div>
								)}
							</div>
						</div>
					)}

					{/* Pay Information */}
					{(employeeDetails.pay_type || employeeDetails.pay_frequency || employeeDetails.overtime_rate || employeeDetails.standard_hours) && (
						<div className="space-y-4">
							<h3 className="text-lg font-semibold flex items-center gap-2">
								<DollarSign className="h-4 w-4" />
								Pay Information
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
								{employeeDetails.pay_type && (
									<div className="space-y-2">
										<p className="text-sm font-medium">Pay Type</p>
										<p className="text-sm text-muted-foreground">{employeeDetails.pay_type}</p>
									</div>
								)}
								{employeeDetails.pay_frequency && (
									<div className="space-y-2">
										<p className="text-sm font-medium">Pay Frequency</p>
										<p className="text-sm text-muted-foreground">{employeeDetails.pay_frequency}</p>
									</div>
								)}
								{employeeDetails.overtime_rate && (
									<div className="space-y-2">
										<p className="text-sm font-medium">Overtime Rate</p>
										<p className="text-sm text-muted-foreground">{employeeDetails.overtime_rate}</p>
									</div>
								)}
								{employeeDetails.standard_hours && (
									<div className="space-y-2">
										<p className="text-sm font-medium">Standard Hours</p>
										<p className="text-sm text-muted-foreground">{employeeDetails.standard_hours}</p>
									</div>
								)}
							</div>
						</div>
					)}

					{/* Actions */}
					<div className="flex justify-end gap-2 pt-4 border-t">
						<Button variant="outline" onClick={() => setOpen(false)}>
							Close
						</Button>
					</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	)
}
