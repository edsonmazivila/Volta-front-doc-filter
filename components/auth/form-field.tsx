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
			<label className="block text-sm font-medium text-neutral-200">
				{label}
				{required && <span className="text-red-400 ml-1">*</span>}
			</label>
			{children}
			{error && (
				<p className="text-sm text-red-400" role="alert">
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
				'bg-white/5 border-white/10 text-white placeholder:text-neutral-400',
				'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
				'disabled:opacity-50 disabled:cursor-not-allowed',
				error && 'border-red-400 focus:ring-red-400',
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
					'mt-1 h-4 w-4 rounded border-white/20 bg-white/5',
					'focus:ring-2 focus:ring-blue-500 focus:ring-offset-0',
					'text-blue-600',
					error && 'border-red-400',
					className
				)}
				{...props}
			/>
			<label className="text-sm text-neutral-300 leading-5">
				{label}
			</label>
		</div>
	)
}
