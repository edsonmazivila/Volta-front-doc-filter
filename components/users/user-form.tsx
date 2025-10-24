'use client'

import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormField, Input, Checkbox } from '@/components/auth/form-field'
import { PasswordInput } from '@/components/auth/password-input'
import { ROLES, ROLE_DISPLAY_NAMES } from '@/lib/rbac/types'
import type { UserRole } from '@/lib/auth/types'
import { User, createUserAction, updateUserAction } from '@/lib/services/users'
import { useToast } from '@/components/ui/toast'

// Form schemas
const createUserSchema = z.object({
	full_name: z.string().min(1, 'Full name is required').min(2, 'Full name must be at least 2 characters'),
	email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
	password: z.string().min(8, 'Password must be at least 8 characters').optional().or(z.literal('')),
	role: z.enum([ROLES.EMPLOYEE, ROLES.OPERATIONAL_MANAGER, ROLES.HR_MANAGER, ROLES.PAYROLL_MANAGER, ROLES.SYSTEM_ADMIN]),
	is_active: z.boolean().default(true),
	can_login: z.boolean().default(true),
	is_employee: z.boolean().default(false),
	// Employee fields
	employee_number: z.string().optional(),
	employment_type: z.string().optional(),
	employment_status: z.string().optional(),
	hire_date: z.string().optional(),
	termination_date: z.string().optional(),
	job_title: z.string().optional(),
	manager_id: z.string().optional(),
	department_id: z.string().optional(),
	date_of_birth: z.string().optional(),
	phone_primary: z.string().optional(),
	phone_secondary: z.string().optional(),
	emergency_contact_name: z.string().optional(),
	emergency_contact_phone: z.string().optional(),
	emergency_contact_relationship: z.string().optional(),
	address_line1: z.string().optional(),
	address_line2: z.string().optional(),
	city: z.string().optional(),
	state: z.string().optional(),
	postal_code: z.string().optional(),
	country: z.string().optional(),
	tax_filing_status: z.string().optional(),
	tax_allowances: z.number().optional(),
	additional_tax_withholding: z.number().optional(),
	tax_exempt: z.boolean().optional(),
	bank_name: z.string().optional(),
	bank_account_type: z.string().optional(),
	// Compensation
	pay_type: z.string().optional(),
	pay_frequency: z.string().optional(),
	annual_salary: z.number().optional(),
	hourly_rate: z.number().optional(),
	standard_hours: z.number().optional(),
	overtime_rate: z.number().optional(),
})

const editUserSchema = z.object({
	full_name: z.string().min(1, 'Full name is required').min(2, 'Full name must be at least 2 characters'),
	email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
	password: z.string().optional(),
	role: z.enum([ROLES.EMPLOYEE, ROLES.OPERATIONAL_MANAGER, ROLES.HR_MANAGER, ROLES.PAYROLL_MANAGER, ROLES.SYSTEM_ADMIN]),
	is_active: z.boolean().default(true),
	can_login: z.boolean().default(true),
	is_employee: z.boolean().default(false),
	// Employee fields
	employee_number: z.string().optional(),
	employment_type: z.string().optional(),
	employment_status: z.string().optional(),
	hire_date: z.string().optional(),
	termination_date: z.string().optional(),
	job_title: z.string().optional(),
	manager_id: z.string().optional(),
	department_id: z.string().optional(),
	date_of_birth: z.string().optional(),
	phone_primary: z.string().optional(),
	phone_secondary: z.string().optional(),
	emergency_contact_name: z.string().optional(),
	emergency_contact_phone: z.string().optional(),
	emergency_contact_relationship: z.string().optional(),
	address_line1: z.string().optional(),
	address_line2: z.string().optional(),
	city: z.string().optional(),
	state: z.string().optional(),
	postal_code: z.string().optional(),
	country: z.string().optional(),
	tax_filing_status: z.string().optional(),
	tax_allowances: z.number().optional(),
	additional_tax_withholding: z.number().optional(),
	tax_exempt: z.boolean().optional(),
	bank_name: z.string().optional(),
	bank_account_type: z.string().optional(),
	// Compensation
	pay_type: z.string().optional(),
	pay_frequency: z.string().optional(),
	annual_salary: z.number().optional(),
	hourly_rate: z.number().optional(),
	standard_hours: z.number().optional(),
	overtime_rate: z.number().optional(),
})

// Schema types are inferred automatically

interface UserFormProps {
	mode?: 'create' | 'edit'
	user?: User | null
	onSubmit?: (data: unknown) => void
	onSuccess?: () => void
	onCancel: () => void
}

export function UserForm({ mode = 'create', user, onSubmit, onSuccess, onCancel }: UserFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [canLogin, setCanLogin] = useState<boolean>(user?.can_login ?? true)
	const { showToast } = useToast()
	
	const schema = mode === 'create' ? createUserSchema : editUserSchema
	const isEditMode = mode === 'edit'

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
		control
	} = useForm({
		resolver: zodResolver(schema),
		defaultValues: {
			full_name: user?.full_name || '',
			email: user?.email || '',
			password: '',
			role: (user?.role as UserRole) || ROLES.EMPLOYEE,
			is_active: user?.is_active ?? true,
			can_login: user?.can_login ?? true,
			is_employee: user?.is_employee ?? false
		}
	})

	// Reset form when user changes
	useEffect(() => {
		if (user) {
			reset({
				full_name: user.full_name,
				email: user.email,
				password: '',
				role: user.role as UserRole,
				is_active: user.is_active,
				can_login: user.can_login,
				is_employee: user.is_employee
			})
		}
	}, [user, reset])

	const handleFormSubmit = async (data: Record<string, unknown>) => {
		setIsSubmitting(true)
		try {
			// Dynamic validation based on can_login
			if (canLogin) {
				// If can_login is true, email and password are required
				if (!data.email || data.email === '') {
					showToast({
						type: 'error',
						message: 'Email is required when user can login',
						title: 'Validation Error'
					})
					setIsSubmitting(false)
					return
				}
				if (!isEditMode && (!data.password || data.password === '')) {
					showToast({
						type: 'error',
						message: 'Password is required when user can login',
						title: 'Validation Error'
					})
					setIsSubmitting(false)
					return
				}
			} else {
				// If can_login is false, remove email and password
				delete data.email
				delete data.password
			}
			
			// Remove empty password for edit mode
			if (isEditMode && !data.password) {
				delete data.password
			}
			
			if (onSubmit) {
				await onSubmit(data)
			} else {
				// Default behavior - perform the actual operation
				const formData = new FormData()
				Object.entries(data).forEach(([key, value]) => {
					if (value !== undefined && value !== null) {
						formData.append(key, String(value))
					}
				})

				let result
				if (isEditMode && user) {
					result = await updateUserAction(user.id, null, formData)
				} else {
					result = await createUserAction(null, formData)
				}

				if ('errors' in result) {
					// Handle validation errors
					const errorMessages = Object.values(result.errors).flat()
					showToast({
						type: 'error',
						message: errorMessages.join(', '),
						title: 'Validation Error'
					})
				} else {
					// Success
					showToast({
						type: 'success',
						message: isEditMode ? 'User updated successfully' : 'User created successfully',
						title: 'Success'
					})
					onSuccess?.()
				}
			}
		} catch {
			showToast({
				type: 'error',
				message: 'An unexpected error occurred',
				title: 'Error'
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	const roleOptions = [
		{ value: ROLES.EMPLOYEE, label: ROLE_DISPLAY_NAMES[ROLES.EMPLOYEE] },
		{ value: ROLES.OPERATIONAL_MANAGER, label: ROLE_DISPLAY_NAMES[ROLES.OPERATIONAL_MANAGER] },
		{ value: ROLES.HR_MANAGER, label: ROLE_DISPLAY_NAMES[ROLES.HR_MANAGER] },
		{ value: ROLES.PAYROLL_MANAGER, label: ROLE_DISPLAY_NAMES[ROLES.PAYROLL_MANAGER] },
		{ value: ROLES.SYSTEM_ADMIN, label: ROLE_DISPLAY_NAMES[ROLES.SYSTEM_ADMIN] }
	]

	return (
		<form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
			<FormField
				label="Full Name"
				error={errors.full_name?.message as string}
				required
			>
				<Input
					type="text"
					placeholder="John Doe"
					error={!!errors.full_name}
					disabled={isSubmitting}
					{...register('full_name')}
				/>
			</FormField>

			{canLogin && (
				<>
					<FormField
						label="Email Address"
						error={errors.email?.message as string}
						required={true}
					>
						<Input
							type="email"
							placeholder="john.doe@company.com"
							error={!!errors.email}
							disabled={isSubmitting}
							{...register('email')}
						/>
					</FormField>

					<FormField
						label={isEditMode ? "New Password (leave blank to keep current)" : "Password"}
						error={errors.password?.message as string}
						required={!isEditMode}
					>
						<PasswordInput
							placeholder={isEditMode ? "Enter new password" : "••••••••"}
							error={!!errors.password}
							disabled={isSubmitting}
							{...register('password')}
						/>
					</FormField>
				</>
			)}

			<FormField
				label="Role"
				error={errors.role?.message as string}
				required
			>
				<Controller
					name="role"
					control={control}
					render={({ field }) => (
						<Select
							value={(field.value as string) || ROLES.EMPLOYEE}
							onValueChange={field.onChange}
							disabled={isSubmitting}
						>
							<SelectTrigger className="w-full bg-neutral-900/90 text-white border-white/20">
								<SelectValue placeholder="Select a role" />
							</SelectTrigger>
							<SelectContent className="bg-neutral-900 text-white border-white/10">
								{roleOptions.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					)}
				/>
			</FormField>

			<div className="space-y-3">
				<FormField label="" error={errors.is_active?.message as string}>
					<Checkbox
						label="User is active"
						error={!!errors.is_active}
						disabled={isSubmitting}
						{...register('is_active')}
					/>
				</FormField>

				<FormField label="" error={errors.can_login?.message as string}>
					<Checkbox
						label="Can login to system"
						error={!!errors.can_login}
						disabled={isSubmitting}
						checked={canLogin}
						onChange={(e) => {
							const checked = e.target.checked;
							setCanLogin(checked);
							// Update form value
							const event = { target: { name: 'can_login', value: checked } };
							register('can_login').onChange(event);
						}}
					/>
				</FormField>

				<FormField label="" error={errors.is_employee?.message as string}>
					<Checkbox
						label="Is employee (has employee record)"
						error={!!errors.is_employee}
						disabled={isSubmitting}
						{...register('is_employee')}
					/>
				</FormField>
			</div>

			<div className="flex gap-3 justify-end pt-4 border-t border-white/10">
				<Button
					type="button"
					variant="ghost"
					onClick={onCancel}
					disabled={isSubmitting}
				>
					Cancel
				</Button>
				<Button
					type="submit"
					variant="default"
					disabled={isSubmitting}
					className="flex items-center gap-2"
				>
					{isSubmitting ? 'Saving...' : isEditMode ? 'Update User' : 'Create User'}
				</Button>
			</div>
		</form>
	)
}
