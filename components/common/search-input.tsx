"use client"
import { ChangeEvent } from 'react'

export function SearchInput({ value, onChange, placeholder = 'Search' }: { value: string, onChange: (v: string) => void, placeholder?: string }) {
	const handle = (e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)
	return (
		<input
			value={value}
			onChange={handle}
			placeholder={placeholder}
			className="w-full rounded-md bg-background border border-[var(--border)] px-3 py-2 outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]"
		/>
	)
}


