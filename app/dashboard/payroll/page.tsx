import { Header } from '@/components/dashboard/header'
import { Card, CardHeader } from '@/components/dashboard/card'
import { requireRole } from '@/lib/rbac/server'
import { getPayrollRuns, getPayrollStats } from '@/lib/services/payroll'
import { getPaySchedules } from '@/lib/services/company'
import { PayrollSection } from '@/components/payroll/payroll-section'
import { formatCurrency } from '@/lib/utils'
import { DollarSign, TrendingUp, Receipt } from 'lucide-react'
import { t } from '@lingui/core/macro'
import { getLocaleAndInitialize } from '@/lib/i18n/server'

export default async function PayrollPage() {
  await getLocaleAndInitialize()
  await requireRole(['payroll_manager', 'system_admin', 'organization_admin'])
  
  // Fetch data with proper error handling
  const [runs, stats, paySchedules] = await Promise.all([
    getPayrollRuns().catch((err) => {
      console.warn('[Payroll Page] Failed to fetch payroll runs:', err.message)
      return []
    }), 
    getPayrollStats().catch((err) => {
      console.warn('[Payroll Page] Failed to fetch payroll stats:', err.message)
      return { totalEmployees: 0, gross: 0, net: 0, taxes: 0 }
    }),
    getPaySchedules().catch((err) => {
      console.warn('[Payroll Page] Failed to fetch pay schedules:', err.message)
      return []
    })
  ])

  return (
    <>
      <Header title={t`Payroll`} />
      <section className='p-4 grid gap-4 overflow-y-auto'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {/* Gross Payroll Card */}
          <Card className='group hover:shadow-lg transition-all duration-300 relative overflow-hidden'>
            <div className='absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-green-500/20 transition-colors' />
            <div className='relative'>
              <div className='flex items-center justify-between mb-3'>
                <div className='w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors'>
                  <DollarSign className='h-6 w-6 text-green-500' />
                </div>
              </div>
              <p className='text-sm text-muted-foreground mb-1'>{t`Gross Payroll`}</p>
              <p className='text-3xl font-bold text-foreground'>{formatCurrency(stats.gross ?? 0)}</p>
            </div>
          </Card>

          {/* Net Payroll Card */}
          <Card className='group hover:shadow-lg transition-all duration-300 relative overflow-hidden'>
            <div className='absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/20 transition-colors' />
            <div className='relative'>
              <div className='flex items-center justify-between mb-3'>
                <div className='w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors'>
                  <TrendingUp className='h-6 w-6 text-blue-500' />
                </div>
              </div>
              <p className='text-sm text-muted-foreground mb-1'>{t`Net Payroll`}</p>
              <p className='text-3xl font-bold text-foreground'>{formatCurrency(stats.net ?? 0)}</p>
            </div>
          </Card>

          {/* Tax Withholding Card */}
          <Card className='group hover:shadow-lg transition-all duration-300 relative overflow-hidden'>
            <div className='absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-orange-500/20 transition-colors' />
            <div className='relative'>
              <div className='flex items-center justify-between mb-3'>
                <div className='w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors'>
                  <Receipt className='h-6 w-6 text-orange-500' />
                </div>
              </div>
              <p className='text-sm text-muted-foreground mb-1'>{t`Tax Withholding`}</p>
              <p className='text-3xl font-bold text-foreground'>{formatCurrency(stats.taxes ?? 0)}</p>
            </div>
          </Card>
        </div>
        <Card>
          <CardHeader title={t`Payroll Processing`} />
          <PayrollSection runs={runs} paySchedules={paySchedules} />
        </Card>
      </section>
    </>
  )
}
