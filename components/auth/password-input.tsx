'use client'

import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from './form-field'
import { cn } from '@/lib/utils'
import { useLingui } from "@lingui/react"
import { msg } from "@lingui/core/macro"

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	error?: boolean
}

export function PasswordInput({ error, className, ...props }: PasswordInputProps) {
	const { i18n } = useLingui()
	const [showPassword, setShowPassword] = useState(false)

	return (
		<div className="relative">
			<Input
				type={showPassword ? 'text' : 'password'}
				error={error}
				className={cn('pr-12', className)}
				{...props}
			/>
			<button
				type="button"
				onClick={() => setShowPassword(!showPassword)}
				className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:opacity-80 transition-colors"
				aria-label={showPassword ? i18n._(msg`Hide password`) : i18n._(msg`Show password`)}
			>
				{showPassword ? (
					<EyeOff className="h-4 w-4" />
				) : (
					<Eye className="h-4 w-4" />
				)}
			</button>
		</div>
	)
}

// Password strength indicator
export function PasswordStrength({ password }: { password: string }) {
	const { i18n } = useLingui()
	const getStrength = (pwd: string) => {
		let score = 0
		const checks = {
			length: pwd.length >= 8,
			lowercase: /[a-z]/.test(pwd),
			uppercase: /[A-Z]/.test(pwd),
			number: /\d/.test(pwd),
			special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
		}

		score = Object.values(checks).filter(Boolean).length

		return {
			score,
			checks,
			label: score < 2 ? i18n._(msg`Weak`) : score < 4 ? i18n._(msg`Medium`) : i18n._(msg`Strong`),
			color: score < 2 ? 'red' : score < 4 ? 'yellow' : 'green'
		}
	}

	const strength = getStrength(password)

	if (!password) return null

	return (
		<div className="space-y-2">
			<div className="flex items-center gap-2">
				<div className="flex-1 bg-muted rounded-full h-2">
					<div
						className={cn(
							'h-2 rounded-full transition-all duration-300',
							strength.color === 'red' && 'bg-red-500',
							strength.color === 'yellow' && 'bg-yellow-500',
							strength.color === 'green' && 'bg-green-500'
						)}
						style={{ width: `${(strength.score / 5) * 100}%` }}
					/>
				</div>
				<span className={cn(
					'text-xs font-medium',
					strength.color === 'red' && 'text-red-700 dark:text-red-400',
					strength.color === 'yellow' && 'text-yellow-700 dark:text-yellow-400',
					strength.color === 'green' && 'text-green-700 dark:text-green-400'
				)}>
					{strength.label}
				</span>
			</div>

			<div className="space-y-1">
				{Object.entries(strength.checks).map(([key, passed]) => (
					<div key={key} className="flex items-center gap-2 text-xs">
						<div className={cn(
							'w-1 h-1 rounded-full',
							passed ? 'bg-green-500 dark:bg-green-400' : 'bg-muted'
						)} />
						<span className={cn(
							passed ? 'text-green-700 dark:text-green-400' : 'text-muted-foreground'
						)}>
							{key === 'length' && i18n._(msg`At least 8 characters`)}
							{key === 'lowercase' && i18n._(msg`One lowercase letter`)}
							{key === 'uppercase' && i18n._(msg`One uppercase letter`)}
							{key === 'number' && i18n._(msg`One number`)}
							{key === 'special' && i18n._(msg`One special character`)}
						</span>
					</div>
				))}
			</div>
		</div>
	)
}
