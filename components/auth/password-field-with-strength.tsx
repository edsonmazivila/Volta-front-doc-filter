'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { PasswordStrengthIndicator } from './password-strength-indicator'
import { cn } from '@/lib/utils'

interface PasswordFieldWithStrengthProps {
	id?: string
	name: string
	value: string
	onChange: (value: string) => void
	placeholder?: string
	disabled?: boolean
	showStrength?: boolean
	className?: string
	autoComplete?: string
	required?: boolean
	label?: string
}

export function PasswordFieldWithStrength({
	id,
	name,
	value,
	onChange,
	placeholder,
	disabled = false,
	showStrength = false,
	className,
	autoComplete = 'new-password',
	required = false,
	label,
}: PasswordFieldWithStrengthProps) {
	const [showPassword, setShowPassword] = useState(false)

	return (
		<div className={className}>
			{label && (
				<label htmlFor={id || name} className="block text-sm font-medium mb-2">
					{label}
				</label>
			)}
			<div className="relative">
				<input
					id={id || name}
					name={name}
					type={showPassword ? 'text' : 'password'}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					placeholder={placeholder}
					disabled={disabled}
					autoComplete={autoComplete}
					required={required}
					className={cn(
						'w-full border rounded-md px-3 py-2 pr-10 bg-background border-[var(--border)]',
						'focus:outline-none focus:ring-2 focus:ring-blue-500',
						'disabled:opacity-50 disabled:cursor-not-allowed',
					)}
				/>
				<button
					type="button"
					onClick={() => setShowPassword(!showPassword)}
					className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:opacity-80 transition-colors"
					aria-label={showPassword ? 'Hide password' : 'Show password'}
					disabled={disabled}
					tabIndex={-1}
				>
					{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
				</button>
			</div>
			{showStrength && <PasswordStrengthIndicator password={value} showRequirements={true} />}
		</div>
	)
}
