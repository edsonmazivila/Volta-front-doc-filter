'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui'
import { LogOut } from 'lucide-react'

export function LogoutButton({ className = '' }: { className?: string }) {
	const router = useRouter()

	const handleLogout = async () => {
		try {
			await fetch('/api/auth/logout', { method: 'POST' })
		} catch {}
		router.push('/login')
	}

    return (
        <Button type='button' variant='destructive' onClick={handleLogout} aria-label='Logout' className={`${className}  cursor-pointer`}>
            <LogOut size={16} /> Logout
        </Button>
    )
}


