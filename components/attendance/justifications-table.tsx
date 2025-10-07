'use client'

import { useState } from 'react'
import { AttendanceJustification } from '@/lib/types/attendance'
import { approveJustificationAction, rejectJustificationAction } from '@/lib/services/attendance'
import { Button } from '@/components/ui'
import { toast } from 'sonner'

interface JustificationsTableProps {
  justifications: AttendanceJustification[]
}

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
}

export function JustificationsTable({ justifications }: JustificationsTableProps) {
  const [processing, setProcessing] = useState<Record<number, boolean>>({})

  const handleApprove = async (id: number) => {
    setProcessing((prev) => ({ ...prev, [id]: true }))
    try {
      const result = await approveJustificationAction(id)
      if ('errors' in result) {
        toast.error(result.errors._form?.[0] || 'Failed to approve')
      } else {
        toast.success('Justification approved')
      }
    } catch {
      toast.error('An error occurred')
    } finally {
      setProcessing((prev) => ({ ...prev, [id]: false }))
    }
  }

  const handleReject = async (id: number) => {
    setProcessing((prev) => ({ ...prev, [id]: true }))
    try {
      const result = await rejectJustificationAction(id)
      if ('errors' in result) {
        toast.error(result.errors._form?.[0] || 'Failed to reject')
      } else {
        toast.success('Justification rejected')
      }
    } catch {
      toast.error('An error occurred')
    } finally {
      setProcessing((prev) => ({ ...prev, [id]: false }))
    }
  }

  if (justifications.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">No pending justifications</p>
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
            <th className="px-4 py-3">Reason</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Submitted</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {justifications.map((justification) => (
            <tr key={justification.id} className="hover:bg-muted/50">
              <td className="px-4 py-3 text-sm font-medium">
                {justification.employee_name || `Employee #${justification.employee_id}`}
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">
                {new Date(justification.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </td>
              <td className="px-4 py-3 text-sm">
                <span className="max-w-xs block">{justification.reason}</span>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    STATUS_COLORS[justification.status]
                  }`}
                >
                  {justification.status}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">
                {new Date(justification.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </td>
              <td className="px-4 py-3 text-right">
                {justification.status === 'pending' && (
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleApprove(justification.id)}
                      disabled={processing[justification.id]}
                      className="text-green-600 hover:text-green-700"
                    >
                      Approve
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReject(justification.id)}
                      disabled={processing[justification.id]}
                      className="text-red-600 hover:text-red-700"
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
