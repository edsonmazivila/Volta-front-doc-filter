'use client'

import { useState } from 'react'
import { Button } from '@/components/ui'
import { useToastHelpers } from '@/components/ui/toast'
import { changePasswordClient } from '@/lib/services/password-client'
import { validatePassword } from '@/lib/utils/password-validation'
import { PasswordStrengthIndicator } from '@/components/auth/password-strength-indicator'
import { PasswordInput } from '@/components/auth/password-input'
import { useLingui } from '@lingui/react'
import { Trans } from '@lingui/react/macro'
import { msg } from '@lingui/core/macro'

export function ChangePasswordSection() {
	const { i18n } = useLingui()
	const toast = useToastHelpers()
	const [isChanging, setIsChanging] = useState(false)
	const [currentPassword, setCurrentPassword] = useState('')
	const [newPassword, setNewPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)

	const resetForm = () => {
		setCurrentPassword('')
		setNewPassword('')
		setConfirmPassword('')
		setError(null)
	}

	const handleCancel = () => {
		setIsChanging(false)
		resetForm()
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)

		// Client-side validation
		if (!currentPassword) {
			setError(i18n._(msg`Current password is required`))
			return
		}

		const passwordValidation = validatePassword(newPassword)
		if (!passwordValidation.isValid) {
			setError(passwordValidation.errors[0])
			return
		}

		if (newPassword !== confirmPassword) {
			setError(i18n._(msg`Passwords do not match`))
			return
		}

		if (currentPassword === newPassword) {
			setError(i18n._(msg`New password must be different from current password`))
			return
		}

		setIsSubmitting(true)

		try {
			const result = await changePasswordClient(currentPassword, newPassword)

			if (!result.success) {
				setError(result.error)
				return
			}

			// Show success toast
			toast.success(i18n._(msg`Password changed successfully`))
			
			// Reset and close form
			resetForm()
			setIsChanging(false)
		} catch (error) {
			console.error('[ChangePassword] Error:', error)
			setError(i18n._(msg`Network error - please check your connection`))
		} finally {
			setIsSubmitting(false)
		}
	}

	if (!isChanging) {
		return (
			<div className="glass rounded-xl p-6">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-base font-semibold">
							<Trans>Password</Trans>
						</h2>
						<p className="text-sm text-muted-foreground mt-1">
							<Trans>Change your password to keep your account secure</Trans>
						</p>
					</div>
					<Button onClick={() => setIsChanging(true)} type="button">
						<Trans>Change Password</Trans>
					</Button>
				</div>
			</div>
		)
	}

	return (
		<div className="glass rounded-xl p-6">
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-base font-semibold">
					<Trans>Change Password</Trans>
				</h2>
				<Button variant="outline" onClick={handleCancel} type="button" disabled={isSubmitting}>
					<Trans>Cancel</Trans>
				</Button>
			</div>

			{error && (
				<div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-700 dark:text-red-400">
					{error}
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label htmlFor="current-password" className="block text-sm font-medium mb-2">
						<Trans>Current Password</Trans>
					</label>
					<PasswordInput
						id="current-password"
						value={currentPassword}
						onChange={(e) => setCurrentPassword(e.target.value)}
						placeholder={i18n._(msg`Enter your current password`)}
						disabled={isSubmitting}
						autoComplete="current-password"
						required
					/>
				</div>

				<div>
					<label htmlFor="new-password" className="block text-sm font-medium mb-2">
						<Trans>New Password</Trans>
					</label>
					<PasswordInput
						id="new-password"
						value={newPassword}
						onChange={(e) => setNewPassword(e.target.value)}
						placeholder={i18n._(msg`Enter your new password`)}
						disabled={isSubmitting}
						autoComplete="new-password"
						required
					/>
					<PasswordStrengthIndicator password={newPassword} showRequirements={true} />
				</div>

				<div>
					<label htmlFor="confirm-password" className="block text-sm font-medium mb-2">
						<Trans>Confirm New Password</Trans>
					</label>
					<PasswordInput
						id="confirm-password"
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						placeholder={i18n._(msg`Confirm your new password`)}
						disabled={isSubmitting}
						autoComplete="new-password"
						required
					/>
				</div>

				<div className="flex gap-2 pt-2">
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? <Trans>Changing...</Trans> : <Trans>Change Password</Trans>}
					</Button>
					<Button variant="outline" onClick={handleCancel} type="button" disabled={isSubmitting}>
						<Trans>Cancel</Trans>
					</Button>
				</div>
			</form>
		</div>
	)
}
