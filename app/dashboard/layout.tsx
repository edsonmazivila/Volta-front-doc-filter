import { Sidebar } from '@/components/dashboard/sidebar'
import { ReactNode } from 'react'
import { cookies, headers } from 'next/headers'
import { initializeI18n } from '@/lib/i18n/server'
import { defaultLocale, LOCALE_COOKIE_NAME, isValidLocale, type Locale } from '@/lib/i18n'

async function getLocale(): Promise<Locale> {
	const cookieStore = await cookies()
	const headersList = await headers()

	const cookieLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value
	if (cookieLocale && isValidLocale(cookieLocale)) {
		return cookieLocale
	}

	const headerLocale = headersList.get('x-locale')
	if (headerLocale && isValidLocale(headerLocale)) {
		return headerLocale
	}

	return defaultLocale
}

export default async function DashboardLayout({
	children,
}: Readonly<{
	children: ReactNode
}>) {
	const locale = await getLocale()
	await initializeI18n(locale)

	return (
		<div className='min-h-dvh flex app-background'>
			<Sidebar />
			<main className='flex-1 overflow-hidden flex flex-col'>
				{children}
			</main>
		</div>
	)
}