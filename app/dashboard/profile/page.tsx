import { Header } from '@/components/dashboard/header'
import { getProfile } from '@/lib/services/me'
import { Suspense } from 'react'
import { ProfileTabs } from './profile-tabs'
import { t } from '@lingui/core/macro'
import { getLocaleAndInitialize } from '@/lib/i18n/server'

export default async function ProfilePage() {
	await getLocaleAndInitialize()
	const data = await getProfile()
	return (
		<>
			<Header title={t`Profile`} />
			<main className="p-4 md:p-6">
				<Suspense fallback={<div className="text-muted-foreground">{t`Loading…`}</div>}>
					<ProfileTabs initialData={data} />
				</Suspense>
			</main>
		</>
	)
}


