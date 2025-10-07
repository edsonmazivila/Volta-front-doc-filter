'use client'
import type { Paystub } from '@/lib/types/paystubs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui'
import { Download } from 'lucide-react'
import { format, parseISO } from 'date-fns'

interface PaystubDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  paystub: Paystub | null
  onDownload?: (id: string) => void
}

export function PaystubDetailDialog({
  open,
  onOpenChange,
  paystub,
  onDownload,
}: PaystubDetailDialogProps) {
  if (!paystub) {
    return null
  }

  const formattedPeriod = paystub.pay_period_start && paystub.pay_period_end
    ? `${format(parseISO(paystub.pay_period_start), 'MMM d, yyyy')} - ${format(parseISO(paystub.pay_period_end), 'MMM d, yyyy')}`
    : 'N/A'

  const formattedPayDate = paystub.pay_date
    ? format(parseISO(paystub.pay_date), 'MMMM d, yyyy')
    : 'N/A'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Paystub Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium mb-1">Pay Period</div>
              <div className="text-sm text-muted-foreground">{formattedPeriod}</div>
            </div>
            <div>
              <div className="text-sm font-medium mb-1">Pay Date</div>
              <div className="text-sm text-muted-foreground">{formattedPayDate}</div>
            </div>
          </div>

          {/* Earnings Section */}
          <div className="border-t border-[var(--border)] pt-4">
            <h3 className="text-sm font-semibold mb-3">Earnings</h3>
            <div className="space-y-2">
              {paystub.regular_hours && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Regular Hours: {paystub.regular_hours}h
                  </span>
                  <span className="font-medium">${paystub.regular_pay?.toFixed(2) || '0.00'}</span>
                </div>
              )}
              {paystub.overtime_hours && paystub.overtime_hours > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Overtime Hours: {paystub.overtime_hours}h
                  </span>
                  <span className="font-medium">${paystub.overtime_pay?.toFixed(2) || '0.00'}</span>
                </div>
              )}
              <div className="flex justify-between text-sm pt-2 mt-2 border-t border-[var(--border)]">
                <span className="font-semibold">Gross Pay</span>
                <span className="font-semibold">${paystub.gross_pay?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
          </div>

          {/* Deductions Section */}
          <div className="border-t border-[var(--border)] pt-4">
            <h3 className="text-sm font-semibold mb-3">Deductions</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Deductions</span>
                <span className="font-medium">${paystub.total_deductions?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
          </div>

          {/* Net Pay Section */}
          <div className="border-t border-[var(--border)] pt-4 bg-accent/20 -mx-6 px-6 py-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Net Pay</span>
              <span className="text-2xl font-bold text-green-600">
                ${paystub.net_pay?.toFixed(2) || '0.00'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t border-[var(--border)]">
            {onDownload && (
              <Button
                onClick={() => onDownload(paystub.id)}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
