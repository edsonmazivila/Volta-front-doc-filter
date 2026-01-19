'use client'

import { useMemo } from 'react'
import { getPasswordStrength, PASSWORD_REQUIREMENTS } from '@/lib/utils/password-validation'
import { Trans } from '@lingui/react/macro'

interface PasswordStrengthIndicatorProps {
	password: string
	showRequirements?: boolean
}

export function PasswordStrengthIndicator({
	password,
	showRequirements = true,
}: PasswordStrengthIndicatorProps) {
	const strength = useMemo(() => getPasswordStrength(password), [password])

	if (!password) {
		return null
	}

	const colorClasses = {
		red: 'bg-red-500',
		orange: 'bg-orange-500',
		yellow: 'bg-yellow-500',
		blue: 'bg-blue-500',
		green: 'bg-green-500',
	}

	const textColorClasses = {
		red: 'text-red-600 dark:text-red-400',
		orange: 'text-orange-600 dark:text-orange-400',
		yellow: 'text-yellow-600 dark:text-yellow-400',
		blue: 'text-blue-600 dark:text-blue-400',
		green: 'text-green-600 dark:text-green-400',
	}

	const bars = Array.from({ length: 4 }, (_, index) => index < strength.score)

	return (
		<div className="mt-2">
			{/* Strength Bars */}
			<div className="flex gap-1 mb-2">
				{bars.map((isFilled, index) => (
					<div
						key={index}
						className={`h-1 flex-1 rounded-full transition-colors ${
							isFilled ? colorClasses[strength.color] : 'bg-gray-300 dark:bg-gray-700'
						}`}
					/>
				))}
			</div>

			{/* Strength Label */}
			<p className={`text-xs font-medium ${textColorClasses[strength.color]}`}>
				<Trans>Password strength</Trans>: {strength.label}
			</p>

			{/* Requirements Checklist */}
			{showRequirements && (
				<ul className="mt-2 space-y-1">
					{PASSWORD_REQUIREMENTS.map((requirement, index) => {
						const checks = [
							password.length >= 8,
							/[A-Z]/.test(password),
							/[a-z]/.test(password),
							/\d/.test(password),
						]
						const isMet = checks[index]

						return (
							<li key={index} className="flex items-start gap-2 text-xs">
								{isMet ? (
									<svg
										className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											fillRule="evenodd"
											d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
											clipRule="evenodd"
										/>
									</svg>
								) : (
									<svg
										className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											fillRule="evenodd"
											d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
											clipRule="evenodd"
										/>
									</svg>
								)}
								<span className={isMet ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
									{requirement}
								</span>
							</li>
						)
					})}
				</ul>
			)}
		</div>
	)
}
