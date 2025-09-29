'use client'

import React from 'react'
import { useForm, useFormContext, FormProvider, type DefaultValues } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui'
import { FormField, Input, Checkbox } from './form-field'
import { PasswordInput, PasswordStrength } from './password-input'
import type { AnyZodObject, TypeOf } from 'zod'

interface AuthFormProps<TSchema extends AnyZodObject> {
	title: string
	subtitle?: string
	children: React.ReactNode
	onSubmit: (data: TypeOf<TSchema>) => Promise<void>
    // Optional Next.js server action (if provided, form will submit to this instead of onSubmit)
    action?: (formData: FormData) => void | Promise<void>
	schema: TSchema
	defaultValues?: DefaultValues<TypeOf<TSchema>>
	submitText: string
	isLoading?: boolean
	footer?: React.ReactNode
}

export function AuthForm<TSchema extends AnyZodObject>({
	title,
	subtitle,
	children,
	onSubmit,
    action,
	schema,
	defaultValues,
	submitText,
	isLoading = false,
	footer
}: AuthFormProps<TSchema>) {
	const methods = useForm<TypeOf<TSchema>>({
		resolver: zodResolver(schema),
		defaultValues
	})

	const handleFormSubmit = async (data: TypeOf<TSchema>) => {
		try {
			await onSubmit(data)
		} catch (error) {
			console.error('Form submission error:', error)
		}
	}

	return (
		<div className="w-full max-w-md mx-auto">
			<div className="glass rounded-xl p-8">
				<div className="text-center mb-8">
					<h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
					{subtitle && (
						<p className="text-neutral-400 text-sm">{subtitle}</p>
					)}
				</div>

                <FormProvider {...methods}>
                    <form {...(action ? { action } : { onSubmit: methods.handleSubmit(handleFormSubmit) })} className="space-y-6">
						{children}

						<Button
							type="submit"
							variant="primaryGradient"
							className="w-full py-3 text-base font-semibold cursor-pointer"
							disabled={methods.formState.isSubmitting || isLoading}
						>
							{methods.formState.isSubmitting || isLoading ? 'Please wait...' : submitText}
						</Button>
					</form>
				</FormProvider>

				{footer && (
					<div className="mt-6 text-center">
						{footer}
					</div>
				)}
			</div>
		</div>
	)
}

// Reusable form field components
export function EmailField() {
	const { register, formState: { errors, isSubmitting } } = useFormContext()
	
	return (
		<FormField
			label="Email address"
			error={errors.email?.message as string}
			required
		>
			<Input
				type="email"
				placeholder="you@example.com"
				error={!!errors.email}
				disabled={isSubmitting}
				{...register('email')}
			/>
		</FormField>
	)
}

interface PasswordFieldProps {
	placeholder?: string
	showStrength?: boolean
}

export function PasswordField({ placeholder = '••••••••', showStrength = false }: PasswordFieldProps) {
	const { register, formState: { errors, isSubmitting }, watch } = useFormContext()
	const password = watch('password') || ''
	
	return (
		<FormField
			label="Password"
			error={errors.password?.message as string}
			required
		>
			<PasswordInput
				placeholder={placeholder}
				error={!!errors.password}
				disabled={isSubmitting}
				{...register('password')}
			/>
			{showStrength && password && (
				<PasswordStrength password={password} />
			)}
			
		</FormField>
	)
}

export function ConfirmPasswordField() {
	const { register, formState: { errors, isSubmitting } } = useFormContext()
	return (
		<FormField
			label="Confirm password"
			error={errors.confirmPassword?.message as string}
			required
		>
			<PasswordInput
				placeholder="••••••••"
				error={!!errors.confirmPassword}
				disabled={isSubmitting}
				{...register('confirmPassword')}
			/>
		</FormField>
	)
}

export function NameField() {
	const { register, formState: { errors, isSubmitting } } = useFormContext()
	return (
		<FormField
			label="Full name"
			error={errors.name?.message as string}
			required
		>
			<Input
				type="text"
				placeholder="John Doe"
				error={!!errors.name}
				disabled={isSubmitting}
				{...register('name')}
			/>
		</FormField>
	)
}

export function CompanyNameField() {
	const { register, formState: { errors, isSubmitting } } = useFormContext()
	return (
		<FormField
			label="Company name"
			error={errors.companyName?.message as string}
			required
		>
			<Input
				type="text"
				placeholder="Acme Inc."
				error={!!errors.companyName}
				disabled={isSubmitting}
				{...register('companyName')}
			/>
		</FormField>
	)
}


export function TermsField() {
	const { register, formState: { errors, isSubmitting } } = useFormContext()
	return (
		<FormField label="" error={errors.termsAccepted?.message as string}>
			<Checkbox
				label={
					<>
						I agree to the{' '}
						<a href="/terms" className="text-blue-400 hover:text-blue-300 underline">
							Terms of Service
						</a>{' '}
						and{' '}
						<a href="/privacy" className="text-blue-400 hover:text-blue-300 underline">
							Privacy Policy
						</a>
					</>
				}
				error={!!errors.termsAccepted}
				disabled={isSubmitting}
				{...register('termsAccepted')}
			/>
		</FormField>
	)
}
