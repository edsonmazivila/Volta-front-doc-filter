'use client'

import React, { createContext, useContext, useMemo, useState } from 'react'
import type { ClientUser } from '@/lib/auth/types'

interface SessionContextValue {
	user: ClientUser | null
	isAuthenticated: boolean
	setUser: (user: ClientUser | null) => void
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined)

interface SessionProviderProps {
	children: React.ReactNode
	initialUser: ClientUser | null
}

export function SessionProvider({ children, initialUser }: SessionProviderProps) {
	const [user, setUser] = useState<ClientUser | null>(initialUser)

	const value = useMemo<SessionContextValue>(() => ({
		user,
		isAuthenticated: !!user,
		setUser,
	}), [user])

	return (
		<SessionContext.Provider value={value}>
			{children}
		</SessionContext.Provider>
	)
}

export function useSession() {
	const ctx = useContext(SessionContext)
	if (!ctx) throw new Error('useSession must be used within a SessionProvider')
	return ctx
}


