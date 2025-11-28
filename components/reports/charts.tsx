'use client'
import { ResponsiveContainer, LineChart as RLineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, BarChart as RBarChart, Bar, PieChart as RPieChart, Pie, Cell } from 'recharts'
import { useLingui } from '@lingui/react'
import { msg } from '@lingui/core/macro'

export function PayrollLineChart({ labels, total, net, className = '' }: { labels: string[], total: number[], net: number[], className?: string }) {
	const { i18n } = useLingui()
	const data = labels.map((l, i) => ({ label: l, total: total[i] ?? 0, net: net[i] ?? 0 }))
	return (
		<div className={className}>
			<ResponsiveContainer width='100%' height='100%'>
				<RLineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
					<CartesianGrid strokeDasharray='3 3' opacity={0.3} />
					<XAxis dataKey='label' tick={{ fontSize: 12 }} />
					<YAxis tick={{ fontSize: 12 }} />
					<Tooltip />
					<Legend />
					<Line type='monotone' dataKey='total' stroke='#3b82f6' strokeWidth={2} dot={false} name={i18n._(msg`Total Payroll`)} />
					<Line type='monotone' dataKey='net' stroke='#10b981' strokeWidth={2} dot={false} name={i18n._(msg`Net Pay`)} />
				</RLineChart>
			</ResponsiveContainer>
		</div>
	)
}

export function DoughnutChart({ labels, data, className = '' }: { labels: string[], data: number[], className?: string }) {
	const colors = labels.map((_, i) => `hsl(${(i*57)%360} 70% 50%)`)
	const chartData = labels.map((l, i) => ({ name: l, value: data[i] ?? 0 }))
	return (
		<div className={className}>
			<ResponsiveContainer width='100%' height='100%'>
				<RPieChart>
					<Pie data={chartData} dataKey='value' nameKey='name' innerRadius={'60%'} outerRadius={'85%'} paddingAngle={2}>
						{chartData.map((_, i) => (<Cell key={i} fill={colors[i]} />))}
					</Pie>
					<Tooltip />
				</RPieChart>
			</ResponsiveContainer>
		</div>
	)
}

export function StackedBarChart({ labels, datasets, className = '' }: { labels: string[], datasets: Array<{ label: string, color: string, data: number[] }>, className?: string }) {
	const data = labels.map((l, i) => Object.assign({ label: l }, ...datasets.map(d => ({ [d.label]: d.data[i] ?? 0 }))))
	return (
		<div className={className}>
			<ResponsiveContainer width='100%' height='100%'>
				<RBarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
					<CartesianGrid strokeDasharray='3 3' opacity={0.3} />
					<XAxis dataKey='label' tick={{ fontSize: 12 }} />
					<YAxis tick={{ fontSize: 12 }} />
					<Tooltip />
					<Legend />
					{datasets.map(d => (<Bar key={d.label} dataKey={d.label} stackId='a' fill={d.color} />))}
				</RBarChart>
			</ResponsiveContainer>
		</div>
	)
}




