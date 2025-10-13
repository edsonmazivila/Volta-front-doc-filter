import React from 'react'
import { cn } from '@/lib/utils'

interface FormFieldProps {
	label: string
	error?: string
	required?: boolean
	children: React.ReactNode
	className?: string
}

export function FormField({ 
	label, 
	error, 
	required = false, 
	children, 
	className 
}: FormFieldProps) {
	return (
		<div className={cn('space-y-2', className)}>
			<label className="block text-sm font-medium text-foreground">
				{label}
				{required && <span className="text-red-700 dark:text-red-400 ml-1">*</span>}
			</label>
			{children}
			{error && (
				<p className="text-sm text-red-700 dark:text-red-400" role="alert">
					{error}
				</p>
			)}
		</div>
	)
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	error?: boolean
}

export function Input({ error, className, ...props }: InputProps) {
	return (
		<input
			className={cn(
				'w-full px-4 py-3 rounded-lg border transition-colors',
				'bg-background border-[var(--border)] text-foreground placeholder:text-muted-foreground',
				'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
				'disabled:opacity-50 disabled:cursor-not-allowed',
				error && 'border-red-300 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400',
				className
			)}
			{...props}
		/>
	)
}

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label: React.ReactNode
	error?: boolean
}

export function Checkbox({ label, error, className, ...props }: CheckboxProps) {
	return (
		<div className="flex items-start space-x-3">
			<input
				type="checkbox"
				className={cn(
					'mt-1 h-4 w-4 rounded border-[var(--border)] bg-background',
					'focus:ring-2 focus:ring-ring focus:ring-offset-0',
					'text-primary',
					error && 'border-red-300 dark:border-red-400',
					className
				)}
				{...props}
			/>
			<label className="text-sm text-foreground leading-5">
				{label}
			</label>
		</div>
	)
}
