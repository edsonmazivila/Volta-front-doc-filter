'use client'

import { useState } from 'react'
import { AttendanceJustification } from '@/lib/types/attendance'
import { approveJustificationAction, rejectJustificationAction } from '@/lib/services/attendance'
import { Button } from '@/components/ui'
import { toast } from 'sonner'
import { JustificationRejectDialog } from './justification-reject-dialog'
import { useRouter } from 'next/navigation'
import { FileText, ExternalLink } from 'lucide-react'

interface JustificationsTableProps {
  justifications: AttendanceJustification[]
}

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  justified: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

export function JustificationsTable({ justifications }: JustificationsTableProps) {
  const router = useRouter()
  const [processing, setProcessing] = useState<Record<string, boolean>>({})
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [selectedJustification, setSelectedJustification] = useState<AttendanceJustification | null>(null)

  const handleApprove = async (id: string) => {
    setProcessing((prev) => ({ ...prev, [id]: true }))
    try {
      const result = await approveJustificationAction(id)
      if ('errors' in result) {
        toast.error(result.errors._form?.[0] || 'Failed to approve')
      } else {
        toast.success('Justification approved')
        router.refresh()
      }
    } catch {
      toast.error('An error occurred')
    } finally {
      setProcessing((prev) => ({ ...prev, [id]: false }))
    }
  }

  const openRejectDialog = (justification: AttendanceJustification) => {
    setSelectedJustification(justification)
    setRejectDialogOpen(true)
  }

  const handleReject = async (id: string, note: string) => {
    setProcessing((prev) => ({ ...prev, [id]: true }))
    try {
      const result = await rejectJustificationAction(id, note)
      if ('errors' in result) {
        toast.error(result.errors._form?.[0] || 'Failed to reject')
        throw new Error('Rejection failed')
      } else {
        toast.success('Justification rejected')
      }
    } catch {
      toast.error('An error occurred')
      throw new Error('Rejection failed')
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
        <thead className="bg-muted/30">
          <tr className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <th className="px-4 py-3">Employee</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Reason</th>
            <th className="px-4 py-3">Document</th>
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
              <td className="px-4 py-3 text-sm">
                {justification.document_url ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(justification.document_url, '_blank')}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    title={justification.document_filename || 'View document'}
                  >
                    <FileText className="h-4 w-4" />
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                ) : (
                  <span className="text-muted-foreground text-xs">No document</span>
                )}
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
                {(justification.status === 'pending' || justification.status === 'justified') ? (
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleApprove(justification.id)}
                      disabled={processing[justification.id]}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50/50 dark:hover:bg-green-950/20"
                    >
                      Approve
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openRejectDialog(justification)}
                      disabled={processing[justification.id]}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50/50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/20"
                    >
                      Reject
                    </Button>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground capitalize">
                    {justification.status}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <JustificationRejectDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        justification={selectedJustification}
        onReject={handleReject}
      />
    </div>
  )
}
