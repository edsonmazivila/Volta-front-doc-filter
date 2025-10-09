'use client'
import { useMemo, useState } from 'react'
import type { TimesheetListItem } from '@/lib/services/timesheets'
import { Button, Skeleton } from '@/components/ui'
import { TimesheetViewDialog } from './timesheet-view-dialog'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Eye, CheckCircle, XCircle, Clock } from "lucide-react"
import { formatPayPeriod, formatHours, getStatusColor } from '@/lib/utils'

interface TimesheetTableProps {
	items?: TimesheetListItem[]
	isLoading?: boolean
	onNewTimesheet?: () => void
	onEdit?: (id: string) => void
	onSubmit?: (id: string) => void
	onApprove?: (id: string) => void
	onReject?: (id: string) => void
	onDelete?: (id: string) => void
}

export function TimesheetTable({ items = [], isLoading = false, onNewTimesheet, onEdit, onSubmit, onApprove, onReject, onDelete }: TimesheetTableProps) {
	const rows = useMemo(() => items, [items])
	const [viewingTimesheet, setViewingTimesheet] = useState<TimesheetListItem | null>(null)

	const handleRowClick = (timesheet: TimesheetListItem, event: React.MouseEvent) => {
		// Don't open dialog if clicking on buttons or other interactive elements
		const target = event.target as HTMLElement;
		if (
			target.closest('button') ||
			target.closest('input') ||
			target.closest('[role="button"]')
		) {
			return;
		}
		setViewingTimesheet(timesheet);
	}

	function truncateNote(note?: string, max = 40) {
		if (!note) return '-'
		if (note.length <= max) return note
		return note.slice(0, max - 1) + '…'
	}

	if (isLoading) {
		return (
			<div className='space-y-2'>
				{Array.from({ length: 6 }).map((_, i) => (<Skeleton key={i} className='h-10' />))}
			</div>
		)
	}

	if (!rows.length) {
		return (
			<div className="glass rounded-xl overflow-hidden">
				<div className="p-6 text-center text-sm text-muted-foreground">
					No timesheets found
					{onNewTimesheet ? (
						<div className="mt-3">
							<Button onClick={onNewTimesheet}>New Timesheet</Button>
						</div>
					) : null}
				</div>
			</div>
		)
	}

	return (
		<>
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
								<th className="text-left p-3">Pay Period</th>
								<th className="text-left p-3">Total Hours</th>
								<th className="text-left p-3">Notes</th>
								<th className="text-left p-3">Status</th>
								<th className="text-left p-3">Actions</th>
							</tr>
						</thead>
						<tbody>
							{rows.length === 0 ? (
								<tr>
									<td className="p-4" colSpan={6}>
										No timesheets found
									</td>
								</tr>
							) : (
								rows.map(row => (
									<tr 
										key={row.id} 
										className="border-b border-[var(--border)] hover:bg-muted/50 cursor-pointer transition-colors"
										onClick={(event) => handleRowClick(row, event)}
									>
										<td className="p-3">
											{String(row.employeeName)}
										</td>
										<td className="p-3">{formatPayPeriod(row.periodStart, row.periodEnd)}</td>
										<td className="p-3">{formatHours(row.totalHours)}</td>
										<td className="p-3 max-w-[240px] truncate" title={row.notes || ''}>{truncateNote(row.notes)}</td>
										<td className="p-3">
											<span
												className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(row.status)}`}
											>
												{row.status}
											</span>
										</td>
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
															event.stopPropagation();
															setViewingTimesheet(row);
														}}
													>
														<Eye className="mr-2 h-4 w-4" />
														View Details
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={(event) => {
															event.stopPropagation();
															onEdit?.(row.id);
														}}
													>
														<Edit className="mr-2 h-4 w-4" />
														Edit
													</DropdownMenuItem>
													{row.status === 'draft' && onSubmit && (
														<DropdownMenuItem
															onClick={(event) => {
																event.stopPropagation();
																onSubmit(row.id);
															}}
														>
															<Clock className="mr-2 h-4 w-4" />
															Submit
														</DropdownMenuItem>
													)}
													{row.status === 'submitted' && onApprove && (
														<DropdownMenuItem
															onClick={(event) => {
																event.stopPropagation();
																onApprove(row.id);
															}}
														>
															<CheckCircle className="mr-2 h-4 w-4" />
															Approve
														</DropdownMenuItem>
													)}
													{row.status === 'submitted' && onReject && (
														<DropdownMenuItem
															onClick={(event) => {
																event.stopPropagation();
																onReject(row.id);
															}}
														>
															<XCircle className="mr-2 h-4 w-4" />
															Reject
														</DropdownMenuItem>
													)}
													<DropdownMenuItem
														onClick={(event) => {
															event.stopPropagation();
															onDelete?.(row.id);
														}}
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

			{/* Timesheet View Dialog */}
			{viewingTimesheet && (
				<TimesheetViewDialog
					timesheet={viewingTimesheet}
					open={!!viewingTimesheet}
					onOpenChange={(open) => !open && setViewingTimesheet(null)}
				/>
			)}
		</>
	)
}


