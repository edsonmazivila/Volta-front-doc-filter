import { Header } from '@/components/dashboard/header'
import { Card, CardHeader } from '@/components/dashboard/card'
import { requireRole } from '@/lib/rbac/server'
import { getReportsList, getPayrollChart, getEmployeeMetrics, getTaxTrend } from '@/lib/services/reports'
import { ReportsSection } from '@/components/reports/reports-section'

export default async function ReportsPage() {
  // Only managers and admins can access reports
  await requireRole(['operational_manager', 'hr_manager', 'payroll_manager', 'system_admin'])
  const [list, payroll, employee, tax] = await Promise.all([
    getReportsList(),
    getPayrollChart('monthly'),
    getEmployeeMetrics(),
    getTaxTrend('monthly'),
  ])
  return (
    <>
      <Header title='Reports & Analytics' />
      <section className='p-4 grid gap-4 overflow-y-auto'>
        <Card>
          <CardHeader title='Analytics' />
          <ReportsSection initialReports={list} initialPayroll={payroll} initialEmployee={employee} initialTax={tax} />
        </Card>
      </section>
    </>
  )
}
