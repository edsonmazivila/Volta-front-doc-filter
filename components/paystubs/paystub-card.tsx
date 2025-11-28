'use client'
import type { Paystub } from '@/lib/types/paystubs'
import { Button } from '@/components/ui'
import { Eye, Download } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { useLingui } from "@lingui/react"
import { msg } from "@lingui/core/macro"

interface PaystubCardProps {
  paystub: Paystub
  onView: (paystub: Paystub) => void
  onDownload?: (id: string) => void
}

export function PaystubCard({ paystub, onView, onDownload }: PaystubCardProps) {
  const { i18n } = useLingui()
  const formattedPeriod = paystub.pay_period_start && paystub.pay_period_end
    ? `${format(parseISO(paystub.pay_period_start), 'MMM d')} - ${format(parseISO(paystub.pay_period_end), 'MMM d, yyyy')}`
    : i18n._(msg`N/A`)

  const formattedPayDate = paystub.pay_date
    ? format(parseISO(paystub.pay_date), 'MMM d, yyyy')
    : i18n._(msg`N/A`)

  const totalHours = (paystub.regular_hours || 0) + (paystub.overtime_hours || 0)
  const hasAdditionalPay = (paystub.bonus_pay || 0) > 0 || (paystub.commission_pay || 0) > 0

  return (
    <div className="border border-[var(--border)] rounded-lg p-4 bg-card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-medium text-card-foreground">{i18n._(msg`Pay Period`)}</h3>
            {paystub.status && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                paystub.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                paystub.status === 'published' ? 'bg-blue-500/20 text-blue-400' :
                'bg-yellow-500/20 text-yellow-400'
              }`}>
                {paystub.status}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-1">{formattedPeriod}</p>
          <p className="text-xs text-muted-foreground">
            {i18n._(msg`Pay Date`)}: <span className="font-medium">{formattedPayDate}</span>
          </p>
        </div>

        <div className="text-right">
          <div className="text-xs text-muted-foreground mb-1">{i18n._(msg`Net Pay`)}</div>
          <div className="text-lg font-bold text-green-600">
            ${paystub.net_pay?.toFixed(2) || '0.00'}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-[var(--border)]">
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <div className="text-xs text-muted-foreground mb-1">{i18n._(msg`Gross Pay`)}</div>
            <div className="font-medium">${paystub.gross_pay?.toFixed(2) || '0.00'}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">{i18n._(msg`Deductions`)}</div>
            <div className="font-medium">${paystub.total_deductions?.toFixed(2) || '0.00'}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <div className="text-xs text-muted-foreground mb-1">{i18n._(msg`Hours`)}</div>
            <div className="font-medium">
              {totalHours}h
              {paystub.overtime_hours && paystub.overtime_hours > 0 && (
                <span className="text-xs text-muted-foreground ml-1">
                  ({paystub.regular_hours || 0}R + {paystub.overtime_hours}OT)
                </span>
              )}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">{i18n._(msg`Rate`)}</div>
            <div className="font-medium">
              ${paystub.regular_rate?.toFixed(2) || '0.00'}/h
              {paystub.overtime_rate && paystub.overtime_rate !== paystub.regular_rate && (
                <span className="text-xs text-muted-foreground ml-1">
                  (OT: ${paystub.overtime_rate?.toFixed(2)})
                </span>
              )}
            </div>
          </div>
        </div>

        {hasAdditionalPay && (
          <div className="text-sm mb-4 p-2 bg-accent/20 rounded">
            <div className="text-xs text-muted-foreground mb-1">{i18n._(msg`Additional Pay`)}</div>
            <div className="space-y-1">
              {paystub.bonus_pay && paystub.bonus_pay > 0 && (
                <div className="flex justify-between text-xs">
                  <span>{i18n._(msg`Bonus`)}:</span>
                  <span className="font-medium">${paystub.bonus_pay.toFixed(2)}</span>
                </div>
              )}
              {paystub.commission_pay && paystub.commission_pay > 0 && (
                <div className="flex justify-between text-xs">
                  <span>{i18n._(msg`Commission`)}:</span>
                  <span className="font-medium">${paystub.commission_pay.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(paystub)}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-1" />
            {i18n._(msg`View Details`)}
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
