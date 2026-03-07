'use client'

import { useState } from 'react'
import { Button } from '@/components/ui'
import { LogOut } from 'lucide-react'
import { useSession } from '@/components/auth/session-context'
import { logoutAction } from '@/lib/auth/session-actions'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { useLingui } from "@lingui/react"
import { msg } from "@lingui/core/macro"

export function LogoutButton({ className = '' }: { className?: string }) {
	const { setUser } = useSession()
	const { i18n } = useLingui()
	const [isConfirmOpen, setIsConfirmOpen] = useState(false)
	const [isLoggingOut, setIsLoggingOut] = useState(false)

	const handleLogout = async () => {
		setIsLoggingOut(true)
		setUser(null) // Clear client session immediately
		await logoutAction() // Server Action handles cookie deletion and redirect
	}

    return (
		<>
			<Button
				type='button'
				variant='destructive'
				onClick={() => setIsConfirmOpen(true)}
				aria-label={i18n._(msg`Logout`)}
				className={`${className}  cursor-pointer`}
			>
				<LogOut size={16} /> {i18n._(msg`Logout`)}
			</Button>

			<ConfirmationDialog
				open={isConfirmOpen}
				onOpenChange={setIsConfirmOpen}
				title={i18n._(msg`Log out?`)}
				description={i18n._(msg`Are you sure you want to log out?`)}
				confirmText={i18n._(msg`Logout`)}
				cancelText={i18n._(msg`Cancel`)}
				onConfirm={handleLogout}
				variant='destructive'
				isLoading={isLoggingOut}
			/>
		</>
    )
}


