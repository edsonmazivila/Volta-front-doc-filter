"use client"
import { ChangeEvent } from 'react'
import { Search } from 'lucide-react'

export function SearchInput({ value, onChange, placeholder = 'Search' }: { value: string, onChange: (v: string) => void, placeholder?: string }) {
	const handle = (e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)
	return (
		<div className="relative w-full">
			<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
			<input
				value={value}
				onChange={handle}
				placeholder={placeholder}
				className="w-full rounded-md bg-background border border-[var(--border)] pl-10 pr-3 py-2 outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]"
			/>
		</div>
	)
}


