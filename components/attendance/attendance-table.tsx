'use client'

import { useState } from 'react'
import { AttendanceRecord } from '@/lib/types/attendance'
import { deleteAttendanceAction } from '@/lib/services/attendance'
import { Button } from '@/components/ui'
import { toast } from 'sonner'

interface AttendanceTableProps {
  records: AttendanceRecord[]
  onEdit?: (record: AttendanceRecord) => void
}

const STATUS_COLORS: Record<'present'|'absent'|'late'|'half_day'|'on_leave'|'justified', string> = {
  present: 'bg-green-100 text-green-800',
  absent: 'bg-red-100 text-red-800',
  late: 'bg-yellow-100 text-yellow-800',
  half_day: 'bg-blue-100 text-blue-800',
  on_leave: 'bg-purple-100 text-purple-800',
  justified: 'bg-gray-100 text-gray-800',
}

const STATUS_LABELS: Record<'present'|'absent'|'late'|'half_day'|'on_leave'|'justified', string> = {
  present: 'Present',
  absent: 'Absent',
  late: 'Late',
  half_day: 'Half Day',
  on_leave: 'On Leave',
  justified: 'Justified',
}

export function AttendanceTable({ records, onEdit }: AttendanceTableProps) {
  const [deleting, setDeleting] = useState<Record<string, boolean>>({})

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this attendance record?')) return

    setDeleting((prev) => ({ ...prev, [id]: true }))
    try {
      const result = await deleteAttendanceAction(id)
      if ('errors' in result) {
        toast.error(result.errors._form?.[0] || 'Failed to delete')
      } else {
        toast.success('Attendance record deleted')
      }
    } catch {
      toast.error('An error occurred')
    } finally {
      setDeleting((prev) => ({ ...prev, [id]: false }))
    }
  }

  if (records.length === 0) {
    return (
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
        <h3 className="mt-2 text-sm font-medium">No attendance records</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Get started by creating a new attendance record
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border">
        <thead>
          <tr className="text-left text-xs font-medium text-muted-foreground uppercase">
            <th className="px-4 py-3">Employee</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Clock In</th>
            <th className="px-4 py-3">Clock Out</th>
            <th className="px-4 py-3">Hours</th>
            <th className="px-4 py-3">Justification</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {records.map((record) => (
            <tr key={record.id} className="hover:bg-muted/50">
              <td className="px-4 py-3 text-sm font-medium">
                {record.employee_name || `Employee #${record.employee_id}`}
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">
                {new Date(record.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    STATUS_COLORS[record.status]
                  }`}
                >
                  {STATUS_LABELS[record.status]}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">
                {record.clock_in || '-'}
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">
                {record.clock_out || '-'}
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">
                {record.hours_worked ? `${record.hours_worked.toFixed(1)}h` : '-'}
              </td>
              <td className="px-4 py-3 text-sm">
                {record.justification ? (
                  <span className="text-muted-foreground max-w-xs truncate block">
                    {record.justification}
                  </span>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </td>
              <td className="px-4 py-3 text-right text-sm">
                <div className="flex items-center justify-end gap-2">
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(record)}
                    >
                      Edit
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(record.id)}
                    disabled={deleting[record.id]}
                  >
                    {deleting[record.id] ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
