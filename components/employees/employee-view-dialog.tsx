"use client"

import { useState } from "react"
import { type User } from "@/lib/services/users"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Phone, MapPin, User as UserIcon, Building, DollarSign, Users, Loader2, CreditCard } from "lucide-react"
import { ROLE_DISPLAY_NAMES } from "@/lib/rbac/types"
import { useLingui } from "@lingui/react"
import { msg } from "@lingui/core/macro"

interface EmployeeViewDialogProps {
	employee: User
	trigger?: React.ReactNode
	open?: boolean
	onOpenChange?: (open: boolean) => void
}

export function EmployeeViewDialog({ employee, trigger, open: controlledOpen, onOpenChange }: EmployeeViewDialogProps) {
	const [internalOpen, setInternalOpen] = useState(false)
	const open = controlledOpen !== undefined ? controlledOpen : internalOpen
	const setOpen = onOpenChange || setInternalOpen
	const { i18n } = useLingui()

	// Since we now have unified User structure, we already have all details
	const employeeDetails = employee
	const isLoading = false
	const [error] = useState<string | null>(null)

	// Note: With unified User structure, no need to fetch additional details

	// Format date for display
	const formatDate = (dateString?: string) => {
		if (!dateString) return i18n._(msg`Not provided`)
		try {
			return new Date(dateString).toLocaleDateString("en-US", {
				year: "numeric",
				month: "long",
				day: "numeric",
			})
		} catch {
			return i18n._(msg`Invalid date`)
		}
	}

	// Format phone number
	const formatPhone = (phone?: string) => {
		if (!phone) return i18n._(msg`Not provided`)
		// Simple phone formatting - you can enhance this
		return phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3")
	}

	// Format employment type for display
	const formatEmploymentType = (type?: string) => {
		if (!type) return i18n._(msg`Not provided`)
		return type
			.split('_')
			.map(word => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ')
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
						<UserIcon className="h-5 w-5" />
						{i18n._(msg`Employee Details`)}
					</DialogTitle>
				</DialogHeader>

				{isLoading && (
					<div className="flex items-center justify-center py-8">
						<Loader2 className="h-6 w-6 animate-spin" />
						<span className="ml-2">{i18n._(msg`Loading employee details...`)}</span>
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
								{employeeDetails.email || employee.email || i18n._(msg`No email provided`)}
							</p>
							{employeeDetails.employee_number && (
								<p className="text-sm text-muted-foreground">
									{i18n._(msg`Employee #`)}: {employeeDetails.employee_number}
								</p>
							)}
							<div className="flex items-center gap-2 mt-2">
								<Badge
									variant={employeeDetails.can_login ? "default" : "secondary"}
									className={
										employeeDetails.can_login
											? "bg-blue-500/20 text-blue-400 border-blue-500/30"
											: "bg-gray-500/20 text-gray-400 border-gray-500/30"
									}
								>
									{employeeDetails.can_login ? i18n._(msg`Can Login`) : i18n._(msg`No Login Access`)}
								</Badge>
							</div>
						</div>
						<Badge
							variant={(employeeDetails.is_active ?? employee.is_active) ? "default" : "secondary"}
							className={
								(employeeDetails.is_active ?? employee.is_active)
									? "bg-green-500/20 text-green-400 border-green-500/30"
									: "bg-red-500/20 text-red-400 border-red-500/30"
							}
						>
							{(employeeDetails.is_active ?? employee.is_active) ? i18n._(msg`Active`) : i18n._(msg`Inactive`)}
						</Badge>
					</div>

					{/* Basic Information */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="space-y-4">
							<h3 className="text-lg font-semibold flex items-center gap-2">
								<UserIcon className="h-4 w-4" />
								{i18n._(msg`Basic Information`)}
							</h3>
							<div className="space-y-3">
								{employeeDetails.phone_primary && (
									<div className="flex items-center gap-3">
										<Phone className="h-4 w-4 text-muted-foreground" />
										<div>
											<p className="text-sm font-medium">{i18n._(msg`Primary Phone`)}</p>
											<p className="text-sm text-muted-foreground">
												{formatPhone(employeeDetails.phone_primary)}
											</p>
										</div>
									</div>
								)}

								{employeeDetails.phone_secondary && (
									<div className="flex items-center gap-3">
										<Phone className="h-4 w-4 text-muted-foreground" />
										<div>
											<p className="text-sm font-medium">{i18n._(msg`Secondary Phone`)}</p>
											<p className="text-sm text-muted-foreground">
												{formatPhone(employeeDetails.phone_secondary)}
											</p>
										</div>
									</div>
								)}

								{employeeDetails.job_title && (
									<div className="flex items-center gap-3">
										<Building className="h-4 w-4 text-muted-foreground" />
										<div>
											<p className="text-sm font-medium">{i18n._(msg`Job Title`)}</p>
											<p className="text-sm text-muted-foreground">{employeeDetails.job_title}</p>
										</div>
									</div>
								)}

								{employeeDetails.department && (
									<div className="flex items-center gap-3">
										<Building className="h-4 w-4 text-muted-foreground" />
										<div>
											<p className="text-sm font-medium">{i18n._(msg`Department`)}</p>
											<p className="text-sm text-muted-foreground">{employeeDetails.department}</p>
										</div>
									</div>
								)}

								{employeeDetails.role && (
									<div className="flex items-center gap-3">
										<UserIcon className="h-4 w-4 text-muted-foreground" />
										<div>
											<p className="text-sm font-medium">{i18n._(msg`Role`)}</p>
											<p className="text-sm text-muted-foreground">
												{ROLE_DISPLAY_NAMES[employeeDetails.role as keyof typeof ROLE_DISPLAY_NAMES] || employeeDetails.role}
											</p>
										</div>
									</div>
								)}
							</div>
						</div>

						<div className="space-y-4">
							<h3 className="text-lg font-semibold flex items-center gap-2">
								<CalendarDays className="h-4 w-4" />
								{i18n._(msg`Employment Details`)}
							</h3>
							<div className="space-y-3">
								{employeeDetails.employment_type && (
									<div>
										<p className="text-sm font-medium">{i18n._(msg`Employment Type`)}</p>
										<p className="text-sm text-muted-foreground">{formatEmploymentType(employeeDetails.employment_type)}</p>
									</div>
								)}

								{employeeDetails.hire_date && (
									<div>
										<p className="text-sm font-medium">{i18n._(msg`Hire Date`)}</p>
										<p className="text-sm text-muted-foreground">
											{formatDate(employeeDetails.hire_date)}
										</p>
									</div>
								)}

								{employeeDetails.date_of_birth && (
									<div>
										<p className="text-sm font-medium">{i18n._(msg`Date of Birth`)}</p>
										<p className="text-sm text-muted-foreground">
											{formatDate(employeeDetails.date_of_birth)}
										</p>
									</div>
								)}

								{employeeDetails.created_at && (
									<div>
										<p className="text-sm font-medium">{i18n._(msg`Created`)}</p>
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
								{i18n._(msg`Address Information`)}
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
								{i18n._(msg`Emergency Contact`)}
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
								{employeeDetails.emergency_contact_name && (
									<div className="space-y-2">
										<p className="text-sm font-medium">{i18n._(msg`Name`)}</p>
										<p className="text-sm text-muted-foreground">{employeeDetails.emergency_contact_name}</p>
									</div>
								)}
								{employeeDetails.emergency_contact_phone && (
									<div className="space-y-2">
										<p className="text-sm font-medium">{i18n._(msg`Phone`)}</p>
										<p className="text-sm text-muted-foreground">
											{formatPhone(employeeDetails.emergency_contact_phone)}
										</p>
									</div>
								)}
								{employeeDetails.emergency_contact_relationship && (
									<div className="space-y-2">
										<p className="text-sm font-medium">{i18n._(msg`Relationship`)}</p>
										<p className="text-sm text-muted-foreground">{employeeDetails.emergency_contact_relationship}</p>
									</div>
								)}
							</div>
						</div>
					)}

					{/* Tax & Bank Information */}
					{(employeeDetails.tax_filing_status || employeeDetails.tax_allowances || employeeDetails.additional_tax_withholding || employeeDetails.tax_exempt || employeeDetails.bank_name || employeeDetails.bank_account_type) && (
						<div className="space-y-4">
							<h3 className="text-lg font-semibold flex items-center gap-2">
								<CreditCard className="h-4 w-4" />
								{i18n._(msg`Tax & Bank Information`)}
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
								{employeeDetails.tax_filing_status && (
									<div className="space-y-2">
										<p className="text-sm font-medium">{i18n._(msg`Tax Filing Status`)}</p>
										<p className="text-sm text-muted-foreground capitalize">{employeeDetails.tax_filing_status.replace('_', ' ')}</p>
									</div>
								)}
								{employeeDetails.tax_allowances !== undefined && (
									<div className="space-y-2">
										<p className="text-sm font-medium">{i18n._(msg`Tax Allowances`)}</p>
										<p className="text-sm text-muted-foreground">{employeeDetails.tax_allowances}</p>
									</div>
								)}
								{employeeDetails.additional_tax_withholding !== undefined && (
									<div className="space-y-2">
										<p className="text-sm font-medium">{i18n._(msg`Additional Tax Withholding`)}</p>
										<p className="text-sm text-muted-foreground">${employeeDetails.additional_tax_withholding.toFixed(2)}</p>
									</div>
								)}
								{employeeDetails.tax_exempt !== undefined && (
									<div className="space-y-2">
										<p className="text-sm font-medium">{i18n._(msg`Tax Exempt`)}</p>
										<p className="text-sm text-muted-foreground">{employeeDetails.tax_exempt ? i18n._(msg`Yes`) : i18n._(msg`No`)}</p>
									</div>
								)}
								{employeeDetails.bank_name && (
									<div className="space-y-2">
										<p className="text-sm font-medium">{i18n._(msg`Bank Name`)}</p>
										<p className="text-sm text-muted-foreground">{employeeDetails.bank_name}</p>
									</div>
								)}
								{employeeDetails.bank_account_type && (
									<div className="space-y-2">
										<p className="text-sm font-medium">{i18n._(msg`Bank Account Type`)}</p>
										<p className="text-sm text-muted-foreground capitalize">{employeeDetails.bank_account_type}</p>
									</div>
								)}
							</div>
						</div>
					)}

					{/* Pay Information */}
					{employeeDetails.compensation && (
						<div className="space-y-4">
							<h3 className="text-lg font-semibold flex items-center gap-2">
								<DollarSign className="h-4 w-4" />
								{i18n._(msg`Pay Information`)}
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
								{employeeDetails.compensation.pay_type && (
									<div className="space-y-2">
										<p className="text-sm font-medium">{i18n._(msg`Pay Type`)}</p>
										<p className="text-sm text-muted-foreground">{employeeDetails.compensation.pay_type}</p>
									</div>
								)}
								{employeeDetails.compensation.pay_frequency && (
									<div className="space-y-2">
										<p className="text-sm font-medium">{i18n._(msg`Pay Frequency`)}</p>
										<p className="text-sm text-muted-foreground">{employeeDetails.compensation.pay_frequency}</p>
									</div>
								)}
								{employeeDetails.compensation.overtime_rate && (
									<div className="space-y-2">
										<p className="text-sm font-medium">{i18n._(msg`Overtime Rate`)}</p>
										<p className="text-sm text-muted-foreground">{employeeDetails.compensation.overtime_rate}x</p>
									</div>
								)}
								{employeeDetails.compensation.standard_hours && (
									<div className="space-y-2">
										<p className="text-sm font-medium">{i18n._(msg`Standard Hours`)}</p>
										<p className="text-sm text-muted-foreground">{employeeDetails.compensation.standard_hours} {i18n._(msg`hrs/week`)}</p>
									</div>
								)}
								{employeeDetails.compensation.annual_salary && (
									<div className="space-y-2">
										<p className="text-sm font-medium">{i18n._(msg`Annual Salary`)}</p>
										<p className="text-sm text-muted-foreground">${employeeDetails.compensation.annual_salary.toLocaleString()}</p>
									</div>
								)}
								{employeeDetails.compensation.hourly_rate && (
									<div className="space-y-2">
										<p className="text-sm font-medium">{i18n._(msg`Hourly Rate`)}</p>
										<p className="text-sm text-muted-foreground">${employeeDetails.compensation.hourly_rate.toFixed(2)}/{i18n._(msg`hr`)}</p>
									</div>
								)}
							</div>
						</div>
					)}

					{/* Actions */}
					<div className="flex justify-end gap-2 pt-4 border-t">
						<Button variant="outline" onClick={() => setOpen(false)}>
							{i18n._(msg`Close`)}
						</Button>
					</div>
					</div>
				)}

				{/* Empty state when details are unavailable (e.g., 404 due to RBAC) */}
				{!isLoading && !error && !employeeDetails && (
					<div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm text-amber-400">
						{i18n._(msg`You do not have permission to view detailed information for this employee.`)}
					</div>
				)}
			</DialogContent>
		</Dialog>
	)
}
