'use client'

import { useState } from 'react'
import { ProfileForm } from './profile-form'
import { ChangePasswordSection } from '@/components/profile/change-password-section'
import { useLingui } from '@lingui/react'
import { Trans } from '@lingui/react/macro'
import type { MeResponse } from '@/lib/services/me'

interface ProfileTabsProps {
	initialData: MeResponse | null
}

type TabId = 'general' | 'security'

export function ProfileTabs({ initialData }: ProfileTabsProps) {
	const [activeTab, setActiveTab] = useState<TabId>('general')

	const tabs = [
		{ id: 'general' as TabId, label: <Trans>General</Trans> },
		{ id: 'security' as TabId, label: <Trans>Security</Trans> },
	]

	return (
		<div className="space-y-6">
			{/* Tabs Navigation */}
			<div className="border-b border-white/10">
				<nav className="flex space-x-8" aria-label="Tabs">
					{tabs.map((tab) => (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={`
								py-4 px-1 border-b-2 font-medium text-sm transition-colors
								${
									activeTab === tab.id
										? 'border-primary text-primary'
										: 'border-transparent text-muted-foreground hover:text-foreground hover:border-white/20'
								}
							`}
							aria-current={activeTab === tab.id ? 'page' : undefined}
						>
							{tab.label}
						</button>
					))}
				</nav>
			</div>

			{/* Tab Content */}
			<div>
				{activeTab === 'general' && (
					<div className="space-y-6">
						<ProfileForm initialData={initialData} />
					</div>
				)}

				{activeTab === 'security' && (
					<div className="space-y-6">
						<ChangePasswordSection />
						{/* Future: MFA, Security logs, etc */}
					</div>
				)}
			</div>
		</div>
	)
}
