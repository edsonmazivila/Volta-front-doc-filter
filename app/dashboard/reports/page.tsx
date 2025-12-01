import { Header } from '@/components/dashboard/header'
import { Card, CardHeader } from '@/components/dashboard/card'
import { requireRole } from '@/lib/rbac/server'
import { getReportsList, getPayrollChart, getEmployeeMetrics, getTaxTrend } from '@/lib/services/reports'
import { ReportsSection } from '@/components/reports/reports-section'
import { t } from '@lingui/core/macro'
import { getLocaleAndInitialize } from '@/lib/i18n/server'

export default async function ReportsPage() {
  // Initialize i18n for this page to ensure `t` macro works
  await getLocaleAndInitialize()
  // Only managers and admins can access reports
  await requireRole(['operational_manager', 'hr_manager', 'payroll_manager', 'system_admin'])

  // Fetch data with fallbacks to prevent errors
  const [list, payroll, employee, tax] = await Promise.all([
    getReportsList().catch(() => []),
    getPayrollChart('monthly').catch(() => ({ labels: [], totalPayroll: [], netPay: [] })),
    getEmployeeMetrics().catch(() => ({ employmentTypes: { labels: [], data: [] } })),
    getTaxTrend('monthly').catch(() => ({ labels: [] })),
  ])
  return (
    <>
      <Header title={t`Reports & Analytics`} />
      <section className='p-4 grid gap-4 overflow-y-auto'>
        <Card>
          <CardHeader title={t`Analytics`} />
          <ReportsSection initialReports={list} initialPayroll={payroll} initialEmployee={employee} initialTax={tax} />
        </Card>
      </section>
    </>
  )
}
