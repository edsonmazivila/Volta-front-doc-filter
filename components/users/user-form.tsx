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
import { User } from './user-management'

// Form schemas
const createUserSchema = z.object({
	first_name: z.string().min(1, 'First name is required').min(2, 'First name must be at least 2 characters'),
	last_name: z.string().min(1, 'Last name is required').min(2, 'Last name must be at least 2 characters'),
	email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
	password: z.string().min(8, 'Password must be at least 8 characters'),
	role: z.enum([ROLES.EMPLOYEE, ROLES.OPERATIONAL_MANAGER, ROLES.HR_MANAGER, ROLES.PAYROLL_MANAGER, ROLES.SYSTEM_ADMIN, ROLES.ADMIN, ROLES.MANAGER]),
	is_active: z.boolean().default(true)
})

const editUserSchema = z.object({
	first_name: z.string().min(1, 'First name is required').min(2, 'First name must be at least 2 characters'),
	last_name: z.string().min(1, 'Last name is required').min(2, 'Last name must be at least 2 characters'),
	email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
	password: z.string().optional(),
	role: z.enum([ROLES.EMPLOYEE, ROLES.OPERATIONAL_MANAGER, ROLES.HR_MANAGER, ROLES.PAYROLL_MANAGER, ROLES.SYSTEM_ADMIN, ROLES.ADMIN, ROLES.MANAGER]),
	is_active: z.boolean().default(true)
})

// Schema types are inferred automatically

interface UserFormProps {
	mode: 'create' | 'edit'
	user?: User | null
	onSubmit: (data: unknown) => void
	onCancel: () => void
}

export function UserForm({ mode, user, onSubmit, onCancel }: UserFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)
	
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
			first_name: user?.first_name || '',
			last_name: user?.last_name || '',
			email: user?.email || '',
			password: '',
			role: user?.role || ROLES.EMPLOYEE,
			is_active: user?.is_active ?? true
		}
	})

	// Reset form when user changes
	useEffect(() => {
		if (user) {
			reset({
				first_name: user.first_name,
				last_name: user.last_name,
				email: user.email,
				password: '',
				role: user.role,
				is_active: user.is_active
			})
		}
	}, [user, reset])

	const handleFormSubmit = async (data: Record<string, unknown>) => {
		setIsSubmitting(true)
		try {
			// Remove empty password for edit mode
			if (isEditMode && !data.password) {
				delete data.password
			}
			
			await onSubmit(data)
		} catch (error) {
			console.error('Form submission error:', error)
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
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<FormField
					label="First Name"
					error={errors.first_name?.message as string}
					required
				>
					<Input
						type="text"
						placeholder="John"
						error={!!errors.first_name}
						disabled={isSubmitting}
						{...register('first_name')}
					/>
				</FormField>

				<FormField
					label="Last Name"
					error={errors.last_name?.message as string}
					required
				>
					<Input
						type="text"
						placeholder="Doe"
						error={!!errors.last_name}
						disabled={isSubmitting}
						{...register('last_name')}
					/>
				</FormField>
			</div>

			<FormField
				label="Email Address"
				error={errors.email?.message as string}
				required
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

			<FormField label="" error={errors.is_active?.message as string}>
				<Checkbox
					label="User is active"
					error={!!errors.is_active}
					disabled={isSubmitting}
					{...register('is_active')}
				/>
			</FormField>

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
