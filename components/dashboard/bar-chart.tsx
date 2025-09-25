"use client"
import { useMemo } from 'react'
import {
	ResponsiveContainer,
	BarChart as RBarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	CartesianGrid,
} from 'recharts'

interface BarPoint { name: string, value: number }

export function BarChart({ data = [] as BarPoint[] }: { data?: BarPoint[] }) {
	const safeData = useMemo(() => (
		Array.isArray(data) ? data.map(d => ({ name: String(d?.name ?? ''), value: Number(d?.value ?? 0) })) : []
	), [data])

	return (
		<div className="w-full h-[280px]">
			<ResponsiveContainer width="100%" height="100%">
				<RBarChart data={safeData} margin={{ top: 8, right: 0, left: 0, bottom: 0 }} barSize={24}>
					<CartesianGrid vertical={false} stroke="var(--border)" opacity={0.3} />
					<XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} interval={0} />
					<YAxis tickLine={false} axisLine={false} width={36} />
					<Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8 }} />
					<Bar dataKey="value" radius={[6,6,0,0]} fill="url(#barGradient)" />
					<defs>
						<linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor="rgba(59,130,246,1)" />
							<stop offset="100%" stopColor="rgba(99,102,241,0.85)" />
						</linearGradient>
					</defs>
				</RBarChart>
			</ResponsiveContainer>
		</div>
	)
}


