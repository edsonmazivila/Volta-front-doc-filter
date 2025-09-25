import React from 'react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
	size?: 'sm' | 'md' | 'lg'
	className?: string
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
	const sizeClasses = {
		sm: 'h-4 w-4',
		md: 'h-6 w-6',
		lg: 'h-8 w-8'
	}

	return (
		<div
			className={cn(
				'animate-spin rounded-full border-2 border-neutral-300 border-t-blue-500',
				sizeClasses[size],
				className
			)}
		/>
	)
}

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	isLoading?: boolean
	loadingText?: string
	children: React.ReactNode
}

export function LoadingButton({ 
	isLoading = false, 
	loadingText = 'Loading...', 
	children, 
	className,
	disabled,
	...props 
}: LoadingButtonProps) {
	return (
		<button
			className={cn(
				'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
				'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed',
				className
			)}
			disabled={disabled || isLoading}
			{...props}
		>
			{isLoading && <LoadingSpinner size="sm" />}
			{isLoading ? loadingText : children}
		</button>
	)
}
