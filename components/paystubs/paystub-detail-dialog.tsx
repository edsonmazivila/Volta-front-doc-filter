'use client'
import type { Paystub } from '@/lib/types/paystubs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui'
import { Download, Calendar, Clock, DollarSign, TrendingUp } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { useLingui } from "@lingui/react"
import { msg } from "@lingui/core/macro"

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
  const { i18n } = useLingui()

  if (!paystub) {
    return null
  }

  const formattedPeriod = paystub.pay_period_start && paystub.pay_period_end
    ? `${format(parseISO(paystub.pay_period_start), 'MMM d, yyyy')} - ${format(parseISO(paystub.pay_period_end), 'MMM d, yyyy')}`
    : i18n._(msg`N/A`)

  const formattedPayDate = paystub.pay_date
    ? format(parseISO(paystub.pay_date), 'MMMM d, yyyy')
    : i18n._(msg`N/A`)

  const totalHours = (paystub.regular_hours || 0) + (paystub.overtime_hours || 0)
  const hasAdditionalPay = (paystub.bonus_pay || 0) > 0 || (paystub.commission_pay || 0) > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {i18n._(msg`Paystub Details`)}
            {paystub.status && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                paystub.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                paystub.status === 'published' ? 'bg-blue-500/20 text-blue-400' :
                'bg-yellow-500/20 text-yellow-400'
              }`}>
                {paystub.status}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium mb-1">{i18n._(msg`Pay Period`)}</div>
              <div className="text-sm text-muted-foreground">{formattedPeriod}</div>
            </div>
            <div>
              <div className="text-sm font-medium mb-1">{i18n._(msg`Pay Date`)}</div>
              <div className="text-sm text-muted-foreground">{formattedPayDate}</div>
            </div>
          </div>

          {/* Hours and Rates Section */}
          <div className="border-t border-[var(--border)] pt-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {i18n._(msg`Hours & Rates`)}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{i18n._(msg`Regular Hours`)}</span>
                  <span className="font-medium">{paystub.regular_hours || 0}h</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{i18n._(msg`Regular Rate`)}</span>
                  <span className="font-medium">${paystub.regular_rate?.toFixed(2) || '0.00'}/h</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{i18n._(msg`Regular Pay`)}</span>
                  <span className="font-medium">${paystub.regular_pay?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{i18n._(msg`Overtime Hours`)}</span>
                  <span className="font-medium">{paystub.overtime_hours || 0}h</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{i18n._(msg`Overtime Rate`)}</span>
                  <span className="font-medium">${paystub.overtime_rate?.toFixed(2) || '0.00'}/h</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{i18n._(msg`Overtime Pay`)}</span>
                  <span className="font-medium">${paystub.overtime_pay?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </div>
            <div className="flex justify-between text-sm pt-2 mt-2 border-t border-[var(--border)]">
              <span className="font-semibold">{i18n._(msg`Total Hours`)}</span>
              <span className="font-semibold">{totalHours}h</span>
            </div>
          </div>

          {/* Additional Pay Section */}
          {hasAdditionalPay && (
            <div className="border-t border-[var(--border)] pt-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                {i18n._(msg`Additional Pay`)}
              </h3>
              <div className="space-y-2">
                {paystub.bonus_pay && paystub.bonus_pay > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{i18n._(msg`Bonus Pay`)}</span>
                    <span className="font-medium">${paystub.bonus_pay.toFixed(2)}</span>
                  </div>
                )}
                {paystub.commission_pay && paystub.commission_pay > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{i18n._(msg`Commission Pay`)}</span>
                    <span className="font-medium">${paystub.commission_pay.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Earnings Summary */}
          <div className="border-t border-[var(--border)] pt-4">
            <h3 className="text-sm font-semibold mb-3">{i18n._(msg`Earnings Summary`)}</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{i18n._(msg`Regular Pay`)}</span>
                <span className="font-medium">${paystub.regular_pay?.toFixed(2) || '0.00'}</span>
              </div>
              {paystub.overtime_pay && paystub.overtime_pay > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{i18n._(msg`Overtime Pay`)}</span>
                  <span className="font-medium">${paystub.overtime_pay.toFixed(2)}</span>
                </div>
              )}
              {paystub.bonus_pay && paystub.bonus_pay > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{i18n._(msg`Bonus Pay`)}</span>
                  <span className="font-medium">${paystub.bonus_pay.toFixed(2)}</span>
                </div>
              )}
              {paystub.commission_pay && paystub.commission_pay > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{i18n._(msg`Commission Pay`)}</span>
                  <span className="font-medium">${paystub.commission_pay.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm pt-2 mt-2 border-t border-[var(--border)]">
                <span className="font-semibold">{i18n._(msg`Gross Pay`)}</span>
                <span className="font-semibold">${paystub.gross_pay?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
          </div>

          {/* Deductions Section */}
          <div className="border-t border-[var(--border)] pt-4">
            <h3 className="text-sm font-semibold mb-3">{i18n._(msg`Deductions`)}</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{i18n._(msg`Total Deductions`)}</span>
                <span className="font-medium">${paystub.total_deductions?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
          </div>

          {/* Net Pay Section */}
          <div className="border-t border-[var(--border)] pt-4 bg-accent/20 -mx-6 px-6 py-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">{i18n._(msg`Net Pay`)}</span>
              <span className="text-2xl font-bold text-green-600">
                ${paystub.net_pay?.toFixed(2) || '0.00'}
              </span>
            </div>
          </div>

          {/* Year-to-Date Section */}
          <div className="border-t border-[var(--border)] pt-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {i18n._(msg`Year-to-Date Summary`)}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-muted-foreground mb-1">{i18n._(msg`YTD Gross Pay`)}</div>
                <div className="font-medium">${paystub.ytd_gross_pay?.toFixed(2) || '0.00'}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">{i18n._(msg`YTD Deductions`)}</div>
                <div className="font-medium">${paystub.ytd_deductions?.toFixed(2) || '0.00'}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">{i18n._(msg`YTD Net Pay`)}</div>
                <div className="font-medium text-green-600">${paystub.ytd_net_pay?.toFixed(2) || '0.00'}</div>
              </div>
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
                {i18n._(msg`Download PDF`)}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {i18n._(msg`Close`)}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
