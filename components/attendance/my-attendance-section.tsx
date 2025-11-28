'use client'

import { useState, useMemo } from 'react'
import { AttendanceRecord } from '@/lib/types/attendance'
import { Button, Skeleton } from '@/components/ui'
import { Card, CardHeader } from '@/components/dashboard/card'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { createMyAttendanceAction, clockOutMyAttendanceAction } from '@/lib/services/attendance'
import { AttendanceFormDialog } from './attendance-form-dialog'
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { formatTime } from '@/lib/utils'
import { useLingui } from '@lingui/react'
import { msg } from '@lingui/core/macro'

interface MyAttendanceSectionProps {
	records: AttendanceRecord[]
	isLoading?: boolean
}

const STATUS_COLORS = {
	present: 'bg-green-100 text-green-800 border-green-200',
	absent: 'bg-red-100 text-red-800 border-red-200',
	late: 'bg-yellow-100 text-yellow-800 border-yellow-200',
	half_day: 'bg-blue-100 text-blue-800 border-blue-200',
	on_leave: 'bg-purple-100 text-purple-800 border-purple-200',
	justified: 'bg-gray-100 text-gray-800 border-gray-200',
}

const STATUS_ICONS = {
	present: CheckCircle,
	absent: XCircle,
	late: AlertCircle,
	half_day: Clock,
	on_leave: Clock,
	justified: CheckCircle,
}

export function MyAttendanceSection({ records, isLoading = false }: MyAttendanceSectionProps) {
	const { i18n } = useLingui()
	const router = useRouter()
	const [clockingIn, setClockingIn] = useState(false)
	const [clockingOut, setClockingOut] = useState(false)
	const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false)
	const [editingAttendance, setEditingAttendance] = useState<AttendanceRecord | null>(null)
	const [monthFilter, setMonthFilter] = useState(() => {
		const now = new Date()
		return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
	})

	const STATUS_LABELS = {
		present: i18n._(msg`Present`),
		absent: i18n._(msg`Absent`),
		late: i18n._(msg`Late`),
		half_day: i18n._(msg`Half Day`),
		on_leave: i18n._(msg`On Leave`),
		justified: i18n._(msg`Justified`),
	}

	const todayRecord = useMemo(() => {
		const today = new Date().toISOString().split('T')[0]
		return records.find(r => r.date?.startsWith(today))
	}, [records])

	const stats = useMemo(() => {
		const present = records.filter(r => r.status === 'present').length
		const absent = records.filter(r => r.status === 'absent').length
		const late = records.filter(r => r.status === 'late').length
		const total = records.length
		const rate = total > 0 ? ((present + late) / total) * 100 : 0
		return { present, absent, late, total, rate }
	}, [records])

	const handleClockIn = async () => {
		setClockingIn(true)
		try {
			const now = new Date()
			const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
			const formData = new FormData()
			formData.append('date', now.toISOString().split('T')[0])
			formData.append('clock_in', now.toTimeString().slice(0, 5))
			formData.append('timezone', timezone)

			const result = await createMyAttendanceAction(null, formData)
			if ('errors' in result) {
				toast.error(result.errors._form?.[0] || i18n._(msg`Failed to clock in`))
			} else {
				toast.success(i18n._(msg`Clocked in successfully`))
				router.refresh()
			}
		} catch {
			toast.error(i18n._(msg`Failed to clock in`))
		} finally {
			setClockingIn(false)
		}
	}

	const handleClockOut = async () => {
		if (!todayRecord?.date) return

		setClockingOut(true)
		try {
			const now = new Date()
			const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
			const formData = new FormData()
			formData.append('date', todayRecord.date.split('T')[0])
			formData.append('clock_out', now.toTimeString().slice(0, 5))
			formData.append('timezone', timezone)

			const result = await clockOutMyAttendanceAction(null, formData)
			if ('errors' in result) {
				toast.error(result.errors._form?.[0] || i18n._(msg`Failed to clock out`))
			} else {
				toast.success(i18n._(msg`Clocked out successfully`))
				router.refresh()
			}
		} catch {
			toast.error(i18n._(msg`Failed to clock out`))
		} finally {
			setClockingOut(false)
		}
	}

	const handleOpenAttendanceDialog = () => {
		setEditingAttendance(null)
		setAttendanceDialogOpen(true)
	}

	const handleEditAttendance = (attendance: AttendanceRecord) => {
		setEditingAttendance(attendance)
		setAttendanceDialogOpen(true)
	}

	const handleCloseAttendanceDialog = () => {
		setAttendanceDialogOpen(false)
		setEditingAttendance(null)
	}

	return (
		<div className='grid gap-4'>
			{/* Stats Cards */}
			<div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
				<Card className='p-4'>
					<div className='text-sm text-muted-foreground'>Total Days</div>
					<div className='text-2xl font-bold mt-1'>{stats.total}</div>
				</Card>
				<Card className='p-4'>
					<div className='text-sm text-muted-foreground'>Present</div>
					<div className='text-2xl font-bold mt-1 text-green-600'>{stats.present}</div>
				</Card>
				<Card className='p-4'>
					<div className='text-sm text-muted-foreground'>Absent</div>
					<div className='text-2xl font-bold mt-1 text-red-600'>{stats.absent}</div>
				</Card>
				<Card className='p-4'>
					<div className='text-sm text-muted-foreground'>Attendance Rate</div>
					<div className='text-2xl font-bold mt-1'>{stats.rate.toFixed(1)}%</div>
				</Card>
			</div>

			{/* Clock In/Out Card */}
			<Card className='p-6'>
				<div className='flex items-center justify-between mb-4'>
					<div>
						<h3 className='text-lg font-semibold'>Today&apos;s Attendance</h3>
						<p className='text-sm text-muted-foreground'>
							{new Date().toLocaleDateString('en-US', {
								weekday: 'long',
								year: 'numeric',
								month: 'long',
								day: 'numeric',
							})}
						</p>
					</div>
				</div>

				{todayRecord ? (
					<div className='space-y-3'>
						<div className='flex items-center gap-3'>
							<span className='text-sm text-muted-foreground'>Status:</span>
							<span
								className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${
									STATUS_COLORS[todayRecord.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.present
								}`}
							>
								{(() => {
									const Icon = STATUS_ICONS[todayRecord.status as keyof typeof STATUS_ICONS] || Clock
									return <Icon className='h-4 w-4' />
								})()}
								{STATUS_LABELS[todayRecord.status as keyof typeof STATUS_LABELS] || todayRecord.status}
							</span>
						</div>
						{todayRecord.clock_in && (
							<div className='flex items-center gap-3'>
								<span className='text-sm text-muted-foreground'>Clock In:</span>
								<span className='text-sm font-medium'>{formatTime(todayRecord.clock_in)}</span>
							</div>
						)}
						{todayRecord.clock_out && (
							<div className='flex items-center gap-3'>
								<span className='text-sm text-muted-foreground'>Clock Out:</span>
								<span className='text-sm font-medium'>{formatTime(todayRecord.clock_out)}</span>
							</div>
						)}
						{todayRecord.hours_worked !== undefined && todayRecord.hours_worked !== null && (
							<div className='flex items-center gap-3'>
								<span className='text-sm text-muted-foreground'>Hours Worked:</span>
								<span className='text-sm font-medium'>{todayRecord.hours_worked.toFixed(1)}h</span>
							</div>
						)}
						
						{/* Action Buttons */}
						<div className='mt-4 pt-4 border-t border-[var(--border)] space-y-2'>
							{todayRecord.clock_in && !todayRecord.clock_out && (
								<Button 
									onClick={handleClockOut} 
									disabled={clockingOut} 
									variant="outline"
									className="w-full"
								>
									{clockingOut ? 'Clocking Out...' : 'Clock Out'}
								</Button>
							)}
							<Button 
								onClick={() => handleEditAttendance(todayRecord)} 
								variant="outline"
								className="w-full"
								size="sm"
							>
								Edit Today&apos;s Attendance
							</Button>
						</div>
					</div>
				) : (
					<div className='text-center py-6'>
						<p className='text-muted-foreground mb-4'>No attendance recorded for today</p>
						<div className='space-y-2'>
							<Button onClick={handleClockIn} disabled={clockingIn} size='lg' className='w-full'>
								{clockingIn ? 'Clocking In...' : 'Clock In'}
							</Button>
							<Button 
								onClick={handleOpenAttendanceDialog} 
								variant="outline" 
								size="sm" 
								className='w-full'
							>
								Report Issue
							</Button>
						</div>
					</div>
				)}
			</Card>

			{/* Attendance History */}
			<Card>
				<CardHeader
					title='Attendance History'
					action={
						<input
							type='month'
							value={monthFilter}
							onChange={(e) => setMonthFilter(e.target.value)}
							className='px-3 py-2 border border-border bg-background rounded-lg text-sm'
						/>
					}
				/>
				<div className='overflow-x-auto'>
					<table className='min-w-full divide-y divide-border'>
						<thead>
							<tr className='text-left text-xs font-medium text-muted-foreground uppercase'>
								<th className='px-4 py-3'>Date</th>
								<th className='px-4 py-3'>Status</th>
								<th className='px-4 py-3'>Clock In</th>
								<th className='px-4 py-3'>Clock Out</th>
								<th className='px-4 py-3'>Hours</th>
								<th className='px-4 py-3'>Notes</th>
							</tr>
						</thead>
						<tbody className='divide-y divide-border'>
							{isLoading ? (
								Array.from({ length: 5 }).map((_, i) => (
									<tr key={i}>
										<td className='px-4 py-3' colSpan={6}>
											<Skeleton className='h-8 w-full' />
										</td>
									</tr>
								))
							) : records.length === 0 ? (
								<tr>
									<td colSpan={6} className='px-4 py-8 text-center text-muted-foreground'>
										No attendance records found
									</td>
								</tr>
							) : (
								records.map((record) => (
									<tr key={record.id} className='hover:bg-muted/50'>
										<td className='px-4 py-3 text-sm font-medium'>
											{new Date(record.date).toLocaleDateString('en-US', {
												month: 'short',
												day: 'numeric',
												year: 'numeric',
											})}
										</td>
										<td className='px-4 py-3'>
											<span
												className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
													STATUS_COLORS[record.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.present
												}`}
											>
												{(() => {
													const Icon = STATUS_ICONS[record.status as keyof typeof STATUS_ICONS] || Clock
													return <Icon className='h-3 w-3' />
												})()}
												{STATUS_LABELS[record.status as keyof typeof STATUS_LABELS] || record.status}
											</span>
										</td>
										<td className='px-4 py-3 text-sm text-muted-foreground'>
											{record.clock_in ? formatTime(record.clock_in) : '-'}
										</td>
										<td className='px-4 py-3 text-sm text-muted-foreground'>
											{record.clock_out ? formatTime(record.clock_out) : '-'}
										</td>
										<td className='px-4 py-3 text-sm text-muted-foreground'>
											{record.hours_worked ? `${record.hours_worked.toFixed(1)}h` : '-'}
										</td>
										<td className='px-4 py-3 text-sm'>
											{record.justification ? (
												<span className='text-muted-foreground max-w-xs truncate block'>
													{record.justification}
												</span>
											) : (
												<span className='text-muted-foreground'>-</span>
											)}
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</Card>

			{/* Attendance Form Dialog */}
			<AttendanceFormDialog
				open={attendanceDialogOpen}
				onOpenChange={handleCloseAttendanceDialog}
				attendance={editingAttendance}
				isEdit={!!editingAttendance}
			/>
		</div>
	)
}

