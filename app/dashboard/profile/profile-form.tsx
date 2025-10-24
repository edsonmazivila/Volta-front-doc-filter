'use client'
import { useState } from 'react'
import type { MeResponse } from '@/lib/services/me'
import { updateProfileAction } from '@/lib/services/me'
import { Button } from '@/components/ui'

export function ProfileForm({ initialData }: { initialData: MeResponse | null }) {
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState<string | null>(null)
	const [isEditing, setIsEditing] = useState(false)

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

	const user = initialData?.user
	const emp = initialData?.employee

	return (
		<div className="glass rounded-xl p-6">
			{error && (
				<div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-700 dark:text-red-400">{error}</div>
			)}
			{success && (
				<div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-sm text-green-700 dark:text-green-400">{success}</div>
			)}

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
					<div className="md:col-span-2">
						<h3 className="text-sm font-medium text-muted-foreground">User</h3>
					</div>
					<div>
						<p className="text-xs text-muted-foreground">Full name</p>
						<p className="text-base font-medium">{user?.full_name || '-'}</p>
					</div>
					<div>
						<p className="text-xs text-muted-foreground">Email</p>
						<p className="text-base font-medium break-all">{user?.email || '-'}</p>
					</div>

					<div className="md:col-span-2 mt-2">
						<h3 className="text-sm font-medium text-muted-foreground">Employee</h3>
					</div>
					<div className="md:col-span-2">
						<p className="text-xs text-muted-foreground">Address</p>
						<p className="text-base font-medium">{[emp?.address_line1, emp?.address_line2].filter(Boolean).join(', ') || '-'}</p>
					</div>
					<div>
						<p className="text-xs text-muted-foreground">City</p>
						<p className="text-base font-medium">{emp?.city || '-'}</p>
					</div>
					<div>
						<p className="text-xs text-muted-foreground">State</p>
						<p className="text-base font-medium">{emp?.state || '-'}</p>
					</div>
					<div>
						<p className="text-xs text-muted-foreground">Postal code</p>
						<p className="text-base font-medium">{emp?.postal_code || '-'}</p>
					</div>
					<div>
						<p className="text-xs text-muted-foreground">Country</p>
						<p className="text-base font-medium">{emp?.country || '-'}</p>
					</div>
					<div>
						<p className="text-xs text-muted-foreground">Primary phone</p>
						<p className="text-base font-medium">{emp?.phone_primary || '-'}</p>
					</div>
					<div>
						<p className="text-xs text-muted-foreground">Secondary phone</p>
						<p className="text-base font-medium">{emp?.phone_secondary || '-'}</p>
					</div>
					<div className="md:col-span-2">
						<p className="text-xs text-muted-foreground">Emergency contact</p>
						<p className="text-base font-medium">{emp?.emergency_contact_name || '-'}</p>
						<p className="text-sm text-muted-foreground">{emp?.emergency_contact_relationship || ''}</p>
						<p className="text-sm text-muted-foreground">{emp?.emergency_contact_phone || ''}</p>
					</div>
				</div>
			) : (
				<form id="profile-form" action={action} className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="md:col-span-2">
					<h2 className="text-sm font-medium text-muted-foreground">User</h2>
				</div>
				<label className="flex flex-col gap-1 md:col-span-2">
					<span className="text-sm">Full name</span>
					<input name="full_name" defaultValue={user?.full_name || ''} className="w-full border rounded-md px-3 py-2 bg-background border-[var(--border)]" />
				</label>
				<label className="flex flex-col gap-1 md:col-span-2">
					<span className="text-sm">Email</span>
					<input type="email" name="email" defaultValue={user?.email || ''} className="w-full border rounded-md px-3 py-2 bg-background border-[var(--border)]" />
				</label>

				<div className="md:col-span-2 mt-2">
					<h2 className="text-sm font-medium text-muted-foreground">Employee</h2>
				</div>
				<label className="flex flex-col gap-1 md:col-span-2">
					<span className="text-sm">Address line 1</span>
					<input name="address_line1" defaultValue={emp?.address_line1 || ''} className="w-full border rounded-md px-3 py-2 bg-background border-[var(--border)]" />
				</label>
				<label className="flex flex-col gap-1 md:col-span-2">
					<span className="text-sm">Address line 2</span>
					<input name="address_line2" defaultValue={emp?.address_line2 || ''} className="w-full border rounded-md px-3 py-2 bg-background border-[var(--border)]" />
				</label>
				<label className="flex flex-col gap-1">
					<span className="text-sm">City</span>
					<input name="city" defaultValue={emp?.city || ''} className="w-full border rounded-md px-3 py-2 bg-background border-[var(--border)]" />
				</label>
				<label className="flex flex-col gap-1">
					<span className="text-sm">State</span>
					<input name="state" defaultValue={emp?.state || ''} className="w-full border rounded-md px-3 py-2 bg-background border-[var(--border)]" />
				</label>
				<label className="flex flex-col gap-1">
					<span className="text-sm">Postal code</span>
					<input name="postal_code" defaultValue={emp?.postal_code || ''} className="w-full border rounded-md px-3 py-2 bg-background border-[var(--border)]" />
				</label>
				<label className="flex flex-col gap-1">
					<span className="text-sm">Country</span>
					<input name="country" defaultValue={emp?.country || ''} className="w-full border rounded-md px-3 py-2 bg-background border-[var(--border)]" />
				</label>
				<label className="flex flex-col gap-1">
					<span className="text-sm">Primary phone</span>
					<input name="phone_primary" defaultValue={emp?.phone_primary || ''} className="w-full border rounded-md px-3 py-2 bg-background border-[var(--border)]" />
				</label>
				<label className="flex flex-col gap-1">
					<span className="text-sm">Secondary phone</span>
					<input name="phone_secondary" defaultValue={emp?.phone_secondary || ''} className="w-full border rounded-md px-3 py-2 bg-background border-[var(--border)]" />
				</label>
				<label className="flex flex-col gap-1 md:col-span-2">
					<span className="text-sm">Emergency contact name</span>
					<input name="emergency_contact_name" defaultValue={emp?.emergency_contact_name || ''} className="w-full border rounded-md px-3 py-2 bg-background border-[var(--border)]" />
				</label>
				<label className="flex flex-col gap-1">
					<span className="text-sm">Emergency contact phone</span>
					<input name="emergency_contact_phone" defaultValue={emp?.emergency_contact_phone || ''} className="w-full border rounded-md px-3 py-2 bg-background border-[var(--border)]" />
				</label>
				<label className="flex flex-col gap-1">
					<span className="text-sm">Emergency contact relationship</span>
					<input name="emergency_contact_relationship" defaultValue={emp?.emergency_contact_relationship || ''} className="w-full border rounded-md px-3 py-2 bg-background border-[var(--border)]" />
				</label>


			</form>
			)}
		</div>
	)
}


