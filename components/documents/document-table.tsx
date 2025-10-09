'use client'
import { useMemo, useState } from 'react'
import type { DocumentListItem } from '@/lib/services/documents'
import { Button, Skeleton } from '@/components/ui'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Eye, Edit, Check, X, Trash2 } from 'lucide-react'
import { format } from 'date-fns'

interface DocumentTableProps {
	items?: DocumentListItem[]
	isLoading?: boolean
	onApprove?: (id: string) => void
	onReject?: (id: string) => void
	onDelete?: (id: string) => void
	onView?: (id: string) => void
	onEdit?: (id: string) => void
}

export function DocumentTable({ items = [], isLoading = false, onApprove, onReject, onDelete, onView, onEdit }: DocumentTableProps) {
	const rows = useMemo(() => items, [items])
	const [pendingId, setPendingId] = useState<string | null>(null)

	function statusClass(status: string) {
		switch (status) {
			case 'approved': return 'bg-green-500/20 text-green-400'
			case 'rejected': return 'bg-red-500/20 text-red-400'
			case 'pending': return 'bg-yellow-500/20 text-yellow-400'
			case 'uploaded': return 'bg-blue-500/20 text-blue-400'
			default: return 'bg-gray-500/20 text-gray-400'
		}
	}

	function fmtDate(v?: string) {
		if (!v) return '-'
		const d = new Date(v)
		return isNaN(d.getTime()) ? v : format(d, 'yyyy-MM-dd')
	}

	const handleRowClick = (document: DocumentListItem, event: React.MouseEvent) => {
		// Don't open dialog if clicking on buttons or other interactive elements
		const target = event.target as HTMLElement
		if (
			target.closest('button') ||
			target.closest('input') ||
			target.closest('[role="button"]')
		) {
			return
		}
		onView?.(document.id)
	}

	if (isLoading) {
		return (
			<div className='space-y-2'>
				{Array.from({ length: 6 }).map((_, i) => (<Skeleton key={i} className='h-10' />))}
			</div>
		)
	}

	return (
		<div className="glass rounded-xl overflow-hidden">
			<div className="overflow-x-auto">
				<table className="w-full text-sm">
					<thead className="border-b border-[var(--border)] text-neutral-400">
						<tr>
							<th className="text-left p-3">
								<div className="flex items-center gap-2">
									Employee
									<span className="text-xs text-muted-foreground">(click to view details)</span>
								</div>
							</th>
							<th className="text-left p-3">Document</th>
							<th className="text-left p-3">Type</th>
							<th className="text-left p-3">Status</th>
							<th className="text-left p-3">Date</th>
							<th className="text-left p-3">Actions</th>
						</tr>
					</thead>
					<tbody>
						{rows.length === 0 ? (
							<tr>
								<td className="p-4" colSpan={6}>
									No documents found
								</td>
							</tr>
						) : (
							rows.map((row) => (
								<tr 
									key={row.id} 
									className="border-b border-[var(--border)] hover:bg-muted/50 cursor-pointer transition-colors"
									onClick={(event) => handleRowClick(row, event)}
								>
									<td className="p-3">{row.employeeName}</td>
									<td className="p-3">{row.title}</td>
									<td className="p-3 uppercase">{row.type}</td>
									<td className="p-3">
										<span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass(row.status)}`}>
											{row.status}
										</span>
									</td>
									<td className="p-3">{fmtDate(row.createdAt)}</td>
									<td className="p-3">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													size="sm"
													variant="ghost"
													onClick={(event) => event.stopPropagation()}
													className="h-8 w-8 p-0"
												>
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem
													onClick={(event) => {
														event.stopPropagation()
														onView?.(row.id)
													}}
												>
													<Eye className="mr-2 h-4 w-4" />
													View Details
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={(event) => {
														event.stopPropagation()
														onEdit?.(row.id)
													}}
												>
													<Edit className="mr-2 h-4 w-4" />
													Edit
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={(event) => {
														event.stopPropagation()
														setPendingId(row.id)
														onApprove?.(row.id)
														setPendingId(null)
													}}
													disabled={pendingId === row.id}
												>
													<Check className="mr-2 h-4 w-4" />
													Approve
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={(event) => {
														event.stopPropagation()
														onReject?.(row.id)
													}}
													disabled={pendingId === row.id}
													className="text-yellow-400 focus:text-yellow-400"
												>
													<X className="mr-2 h-4 w-4" />
													Reject
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={(event) => {
														event.stopPropagation()
														onDelete?.(row.id)
													}}
													disabled={pendingId === row.id}
													className="text-red-400 focus:text-red-400"
												>
													<Trash2 className="mr-2 h-4 w-4" />
													Delete
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	)
}


