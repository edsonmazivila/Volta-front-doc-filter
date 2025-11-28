'use client'

import { useState } from 'react'
import { AttendanceRecord } from '@/lib/types/attendance'
import { deleteAttendanceAction } from '@/lib/services/attendance'
import { Button } from '@/components/ui'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
	MoreHorizontal,
	Edit,
	Trash2
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDate, formatTime } from '@/lib/utils'
import { useLingui } from '@lingui/react'
import { msg } from '@lingui/core/macro'

interface AttendanceTableProps {
  records: AttendanceRecord[]
  onEdit?: (record: AttendanceRecord) => void
}

const STATUS_COLORS: Record<'present'|'absent'|'late'|'half_day'|'on_leave'|'justified', string> = {
  present: 'bg-green-500/20 text-green-400',
  absent: 'bg-red-500/20 text-red-400',
  late: 'bg-yellow-500/20 text-yellow-400',
  half_day: 'bg-blue-500/20 text-blue-400',
  on_leave: 'bg-purple-500/20 text-purple-400',
  justified: 'bg-gray-500/20 text-gray-400',
}

export function AttendanceTable({ records, onEdit }: AttendanceTableProps) {
  const { i18n } = useLingui()
  const [deleting, setDeleting] = useState<Record<string, boolean>>({})

  const STATUS_LABELS: Record<'present'|'absent'|'late'|'half_day'|'on_leave'|'justified', string> = {
    present: i18n._(msg`Present`),
    absent: i18n._(msg`Absent`),
    late: i18n._(msg`Late`),
    half_day: i18n._(msg`Half Day`),
    on_leave: i18n._(msg`On Leave`),
    justified: i18n._(msg`Justified`),
  }

  const handleDelete = async (id: string) => {
    if (!confirm(i18n._(msg`Are you sure you want to delete this attendance record?`))) return

    setDeleting((prev) => ({ ...prev, [id]: true }))
    try {
      const result = await deleteAttendanceAction(id)
      if ('errors' in result) {
        toast.error(result.errors._form?.[0] || i18n._(msg`Failed to delete`))
      } else {
        toast.success(i18n._(msg`Attendance record deleted`))
      }
    } catch {
      toast.error(i18n._(msg`An error occurred`))
    } finally {
      setDeleting((prev) => ({ ...prev, [id]: false }))
    }
  }

  if (records.length === 0) {
    return (
      <div className="glass rounded-xl overflow-hidden">
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium">{i18n._(msg`No attendance records`)}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {i18n._(msg`Get started by creating a new attendance record`)}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead className="border-b border-[var(--border)] text-neutral-400 sticky top-0 bg-background z-10 shadow-sm">
            <tr>
              <th className="text-left p-3 min-w-[150px]">{i18n._(msg`Employee`)}</th>
              <th className="text-left p-3 min-w-[100px]">{i18n._(msg`Date`)}</th>
              <th className="text-left p-3 min-w-[100px]">{i18n._(msg`Status`)}</th>
              <th className="text-left p-3 min-w-[100px]">{i18n._(msg`Clock In`)}</th>
              <th className="text-left p-3 min-w-[100px]">{i18n._(msg`Clock Out`)}</th>
              <th className="text-left p-3 min-w-[80px]">{i18n._(msg`Hours`)}</th>
              <th className="text-left p-3 min-w-[150px]">{i18n._(msg`Justification`)}</th>
              <th className="text-left p-3 min-w-[100px]">{i18n._(msg`Actions`)}</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr 
                key={record.id} 
                className="border-b border-[var(--border)] hover:bg-muted/50 transition-colors"
              >
                <td className="p-3 text-sm font-medium min-w-[150px]">
                  {record.employee_name || `Employee #${record.employee_id}`}
                </td>
                <td className="p-3 text-sm text-muted-foreground min-w-[100px]">
                  {formatDate(record.date)}
                </td>
                <td className="p-3 min-w-[100px]">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[record.status]}`}
                  >
                    {STATUS_LABELS[record.status]}
                  </span>
                </td>
                <td className="p-3 text-sm text-muted-foreground min-w-[100px]">
                  {record.clock_in ? formatTime(record.clock_in) : '-'}
                </td>
                <td className="p-3 text-sm text-muted-foreground min-w-[100px]">
                  {record.clock_out ? formatTime(record.clock_out) : '-'}
                </td>
                <td className="p-3 text-sm text-muted-foreground min-w-[80px]">
                  {record.hours_worked ? `${record.hours_worked.toFixed(1)}h` : '-'}
                </td>
                <td className="p-3 text-sm min-w-[150px]">
                  {record.justification ? (
                    <span className="text-muted-foreground max-w-xs truncate block">
                      {record.justification}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>
                <td className="p-3 min-w-[100px]">
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
                      {onEdit && (
                        <DropdownMenuItem
                          onClick={() => onEdit(record)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          {i18n._(msg`Edit`)}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => handleDelete(record.id)}
                        disabled={deleting[record.id]}
                        className="text-red-400 focus:text-red-400"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {deleting[record.id] ? i18n._(msg`Deleting...`) : i18n._(msg`Delete`)}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
