'use client'

import { Button } from '@/components/ui'
import { LogOut } from 'lucide-react'
import { useSession } from '@/components/auth/session-context'
import { logoutAction } from '@/lib/auth/session-actions'
import { useLingui } from "@lingui/react"
import { msg } from "@lingui/core/macro"

export function LogoutButton({ className = '' }: { className?: string }) {
	const { setUser } = useSession()
	const { i18n } = useLingui()

	const handleLogout = async () => {
		setUser(null) // Clear client session immediately
		await logoutAction() // Server Action handles cookie deletion and redirect
	}

    return (
        <Button type='button' variant='destructive' onClick={handleLogout} aria-label={i18n._(msg`Logout`)} className={`${className}  cursor-pointer`}>
            <LogOut size={16} /> {i18n._(msg`Logout`)}
        </Button>
    )
}


