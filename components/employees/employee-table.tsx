"use client"
import { useEffect, useState } from 'react'
import { EmployeesService, type Employee, type EmployeeListParams } from '@/lib/services/employees'
import { Button } from '@/components/ui'
import { SearchInput } from '@/components/search-input'

export function EmployeeTable() {
	const [items, setItems] = useState<Employee[]>([])
	const [loading, setLoading] = useState(true)
	const [query, setQuery] = useState('')
	const [status, setStatus] = useState<EmployeeListParams['status']>('all')
	const [sort, setSort] = useState<EmployeeListParams['sort']>('name')
	const [order, setOrder] = useState<EmployeeListParams['order']>('asc')

	useEffect(() => {
		let cancelled = false
		async function load(){
			setLoading(true)
			try {
				const { items } = await EmployeesService.list({ q: query, status, sort, order })
				if (!cancelled) setItems(items)
			} finally {
				if (!cancelled) setLoading(false)
			}
		}
		load()
		return () => { cancelled = true }
	}, [query, status, sort, order])

	return (
		<div className="glass rounded-xl overflow-hidden">
			<div className="p-3 flex items-center gap-2 border-b border-[var(--border)]">
				<SearchInput value={query} onChange={setQuery} placeholder="Search employees" />
				<select value={status} onChange={e => setStatus(e.target.value as EmployeeListParams['status'])} className="rounded-md bg-background border border-[var(--border)] px-3 py-2">
					<option value="all">All</option>
					<option value="active">Active</option>
					<option value="inactive">Inactive</option>
				</select>
				<select value={sort} onChange={e => setSort(e.target.value as EmployeeListParams['sort'])} className="rounded-md bg-background border border-[var(--border)] px-3 py-2">
					<option value="name">Name</option>
					<option value="status">Status</option>
					<option value="department">Department</option>
				</select>
				<select value={order} onChange={e => setOrder(e.target.value as EmployeeListParams['order'])} className="rounded-md bg-background border border-[var(--border)] px-3 py-2">
					<option value="asc">Asc</option>
					<option value="desc">Desc</option>
				</select>
			</div>
			<div className="overflow-x-auto">
				<table className="w-full text-sm">
					<thead className="border-b border-[var(--border)] text-neutral-400">
						<tr>
							<th className="text-left p-3">Name</th>
							<th className="text-left p-3">Email</th>
							<th className="text-left p-3">Department</th>
							<th className="text-left p-3">Status</th>
							<th className="text-left p-3">Actions</th>
						</tr>
					</thead>
					<tbody>
						{loading ? (
							<tr><td className="p-4" colSpan={5}>Loading...</td></tr>
						) : items.length === 0 ? (
							<tr><td className="p-4" colSpan={5}>No employees</td></tr>
						) : items
							.filter(e => !query ? true : `${e.first_name} ${e.last_name} ${e.email} ${e.department||''}`.toLowerCase().includes(query.toLowerCase()))
							.map((e) => (
							<tr key={e.id} className="border-b border-[var(--border)]">
								<td className="p-3">{e.first_name} {e.last_name}</td>
								<td className="p-3">{e.email}</td>
								<td className="p-3">{e.department || '-'}</td>
								<td className="p-3">
									<span className={`px-2 py-1 rounded-full text-xs font-medium ${e.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{e.is_active ? 'Active' : 'Inactive'}</span>
								</td>
								<td className="p-3">
									<div className="flex gap-2">
										<Button size="sm" variant="ghost">Edit</Button>
										<Button size="sm" variant="ghost">Delete</Button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	)
}


