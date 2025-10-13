import { Header } from '@/components/dashboard/header'
import { getProfile } from '@/lib/services/me'
import { Suspense } from 'react'
import { ProfileForm } from './profile-form'

export default async function ProfilePage() {
	const data = await getProfile()
	return (
		<>
			<Header title="Profile" />
			<main className="p-4 md:p-6">
			<Suspense fallback={<div className="text-muted-foreground">Loading…</div>}>
				<ProfileForm initialData={data} />
			</Suspense>
			</main>
		</>
	)
}


