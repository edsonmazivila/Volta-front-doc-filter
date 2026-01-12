'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { MeResponse } from '@/lib/services/me'
import { updateProfileAction } from '@/lib/services/me'
import { Button } from '@/components/ui'
import { ProfilePhotoUpload } from '@/components/profile/profile-photo-upload'
// import { UserAvatar } from '@/components/profile/user-avatar'
import { useSession } from '@/components/auth/session-context'

export function ProfileForm({ initialData }: { initialData: MeResponse | null }) {
	const router = useRouter()
	const { user, setUser } = useSession()
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState<string | null>(null)
	const [isEditing, setIsEditing] = useState(false)
	const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(initialData?.profile_photo_url || null)

	async function action(formData: FormData) {
		setError(null)
		setSuccess(null)
		const res = await updateProfileAction(null, formData)
		if (res.errors) {
			setError(res.errors._form?.[0] || 'Failed to update')
			return
		}
		setSuccess('Profile updated')
		setIsEditing(false)
	}

	const handlePhotoUploadSuccess = (photoUrl: string) => {
		setProfilePhotoUrl(photoUrl)
		setSuccess('Profile photo updated successfully')
		
		// Update session with new photo URL
		if (user) {
			setUser({
				...user,
				profile_photo_url: photoUrl
			})
		}
		
		// Also refresh the page to ensure everything is in sync
		setTimeout(() => {
			router.refresh()
		}, 500)
	}

	return (
		<div className="glass rounded-xl p-6">
			{error && (
				<div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-700 dark:text-red-400">{error}</div>
			)}
			{success && (
				<div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-sm text-green-700 dark:text-green-400">{success}</div>
			)}

			{/* Profile Photo Section */}
			<div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
				<ProfilePhotoUpload
					currentPhotoUrl={profilePhotoUrl}
					onUploadSuccess={handlePhotoUploadSuccess}
					locale="pt-PT"
				/>
			</div>

			<div className="flex items-center justify-between mb-4">
				<h2 className="text-base font-semibold">Profile</h2>
				{!isEditing ? (
					<Button onClick={() => setIsEditing(true)} type="button">Edit</Button>
				) : (
					<div className="flex gap-2">
						<Button type="submit" form="profile-form">Save</Button>
						<Button variant="outline" type="button" onClick={() => setIsEditing(false)}>Cancel</Button>
					</div>
				)}
			</div>

			{!isEditing ? (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<p className="text-xs text-muted-foreground">Full name</p>
						<p className="text-base font-medium">{initialData?.full_name || '-'}</p>
					</div>
					<div>
						<p className="text-xs text-muted-foreground">Email</p>
						<p className="text-base font-medium break-all">{initialData?.email || '-'}</p>
					</div>
					<div className="md:col-span-2">
						<p className="text-xs text-muted-foreground">Address</p>
						<p className="text-base font-medium">{[initialData?.address_line1, initialData?.address_line2].filter(Boolean).join(', ') || '-'}</p>
					</div>
					<div>
						<p className="text-xs text-muted-foreground">City</p>
						<p className="text-base font-medium">{initialData?.city || '-'}</p>
					</div>
					<div>
						<p className="text-xs text-muted-foreground">State</p>
						<p className="text-base font-medium">{initialData?.state || '-'}</p>
					</div>
					<div>
						<p className="text-xs text-muted-foreground">Postal code</p>
						<p className="text-base font-medium">{initialData?.postal_code || '-'}</p>
					</div>
					<div>
						<p className="text-xs text-muted-foreground">Country</p>
						<p className="text-base font-medium">{initialData?.country || '-'}</p>
					</div>
					<div>
						<p className="text-xs text-muted-foreground">Primary phone</p>
						<p className="text-base font-medium">{initialData?.phone_primary || '-'}</p>
					</div>
					<div>
						<p className="text-xs text-muted-foreground">Secondary phone</p>
						<p className="text-base font-medium">{initialData?.phone_secondary || '-'}</p>
					</div>
					<div className="md:col-span-2">
						<p className="text-xs text-muted-foreground">Emergency contact</p>
						<p className="text-base font-medium">{initialData?.emergency_contact_name || '-'}</p>
						<p className="text-sm text-muted-foreground">{initialData?.emergency_contact_relationship || ''}</p>
						<p className="text-sm text-muted-foreground">{initialData?.emergency_contact_phone || ''}</p>
					</div>
				</div>
			) : (
				<form id="profile-form" action={action} className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<label className="flex flex-col gap-1 md:col-span-2">
					<span className="text-sm">Full name</span>
					<input name="full_name" defaultValue={initialData?.full_name || ''} className="w-full border rounded-md px-3 py-2 bg-background border-[var(--border)]" />
				</label>
				<label className="flex flex-col gap-1 md:col-span-2">
					<span className="text-sm">Email</span>
					<input type="email" name="email" defaultValue={initialData?.email || ''} className="w-full border rounded-md px-3 py-2 bg-background border-[var(--border)]" />
				</label>
				<label className="flex flex-col gap-1 md:col-span-2">
					<span className="text-sm">Address line 1</span>
					<input name="address_line1" defaultValue={initialData?.address_line1 || ''} className="w-full border rounded-md px-3 py-2 bg-background border-[var(--border)]" />
				</label>
				<label className="flex flex-col gap-1 md:col-span-2">
					<span className="text-sm">Address line 2</span>
					<input name="address_line2" defaultValue={initialData?.address_line2 || ''} className="w-full border rounded-md px-3 py-2 bg-background border-[var(--border)]" />
				</label>
				<label className="flex flex-col gap-1">
					<span className="text-sm">City</span>
					<input name="city" defaultValue={initialData?.city || ''} className="w-full border rounded-md px-3 py-2 bg-background border-[var(--border)]" />
				</label>
				<label className="flex flex-col gap-1">
					<span className="text-sm">State</span>
					<input name="state" defaultValue={initialData?.state || ''} className="w-full border rounded-md px-3 py-2 bg-background border-[var(--border)]" />
				</label>
				<label className="flex flex-col gap-1">
					<span className="text-sm">Postal code</span>
					<input name="postal_code" defaultValue={initialData?.postal_code || ''} className="w-full border rounded-md px-3 py-2 bg-background border-[var(--border)]" />
				</label>
				<label className="flex flex-col gap-1">
					<span className="text-sm">Country</span>
					<input name="country" defaultValue={initialData?.country || ''} className="w-full border rounded-md px-3 py-2 bg-background border-[var(--border)]" />
				</label>
				<label className="flex flex-col gap-1">
					<span className="text-sm">Primary phone</span>
					<input name="phone_primary" defaultValue={initialData?.phone_primary || ''} className="w-full border rounded-md px-3 py-2 bg-background border-[var(--border)]" />
				</label>
				<label className="flex flex-col gap-1">
					<span className="text-sm">Secondary phone</span>
					<input name="phone_secondary" defaultValue={initialData?.phone_secondary || ''} className="w-full border rounded-md px-3 py-2 bg-background border-[var(--border)]" />
				</label>
				<label className="flex flex-col gap-1 md:col-span-2">
					<span className="text-sm">Emergency contact name</span>
					<input name="emergency_contact_name" defaultValue={initialData?.emergency_contact_name || ''} className="w-full border rounded-md px-3 py-2 bg-background border-[var(--border)]" />
				</label>
				<label className="flex flex-col gap-1">
					<span className="text-sm">Emergency contact phone</span>
					<input name="emergency_contact_phone" defaultValue={initialData?.emergency_contact_phone || ''} className="w-full border rounded-md px-3 py-2 bg-background border-[var(--border)]" />
				</label>
				<label className="flex flex-col gap-1">
					<span className="text-sm">Emergency contact relationship</span>
					<input name="emergency_contact_relationship" defaultValue={initialData?.emergency_contact_relationship || ''} className="w-full border rounded-md px-3 py-2 bg-background border-[var(--border)]" />
				</label>
			</form>
			)}
		</div>
	)
}


