'use client'
import type { Paystub } from '@/lib/types/paystubs'
import { Button } from '@/components/ui'
import { Eye, Download } from 'lucide-react'
import { format, parseISO } from 'date-fns'

interface PaystubCardProps {
  paystub: Paystub
  onView: (paystub: Paystub) => void
  onDownload?: (id: string) => void
}

export function PaystubCard({ paystub, onView, onDownload }: PaystubCardProps) {
  const formattedPeriod = paystub.pay_period_start && paystub.pay_period_end
    ? `${format(parseISO(paystub.pay_period_start), 'MMM d')} - ${format(parseISO(paystub.pay_period_end), 'MMM d, yyyy')}`
    : 'N/A'

  const formattedPayDate = paystub.pay_date
    ? format(parseISO(paystub.pay_date), 'MMM d, yyyy')
    : 'N/A'

  return (
    <div className="border border-[var(--border)] rounded-lg p-4 bg-card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-medium text-card-foreground">Pay Period</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-1">{formattedPeriod}</p>
          <p className="text-xs text-muted-foreground">
            Pay Date: <span className="font-medium">{formattedPayDate}</span>
          </p>
        </div>

        <div className="text-right">
          <div className="text-xs text-muted-foreground mb-1">Net Pay</div>
          <div className="text-lg font-bold text-green-600">
            ${paystub.net_pay?.toFixed(2) || '0.00'}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-[var(--border)]">
        <div className="grid grid-cols-3 gap-4 text-sm mb-4">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Gross Pay</div>
            <div className="font-medium">${paystub.gross_pay?.toFixed(2) || '0.00'}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Deductions</div>
            <div className="font-medium">${paystub.total_deductions?.toFixed(2) || '0.00'}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Hours</div>
            <div className="font-medium">
              {paystub.regular_hours || 0}h
              {paystub.overtime_hours ? ` + ${paystub.overtime_hours}h OT` : ''}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(paystub)}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-1" />
            View Details
          </Button>
          {onDownload && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownload(paystub.id)}
              className="text-green-600 hover:text-green-700"
            >
              <Download className="h-4 w-4 mr-1" />
              PDF
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
