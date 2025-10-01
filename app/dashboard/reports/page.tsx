import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { Card, CardHeader } from '@/components/dashboard/card'
import { requireUser } from '@/lib/auth/dal'
import { fetchReportsList, fetchPayrollChart, fetchEmployeeMetrics, fetchTaxTrend } from '@/lib/services/reports-server'
import { ReportsSection } from '@/components/reports/reports-section'

export default async function ReportsPage() {
  await requireUser()
  const [list, payroll, employee, tax] = await Promise.all([
    fetchReportsList(),
    fetchPayrollChart('monthly'),
    fetchEmployeeMetrics(),
    fetchTaxTrend('monthly'),
  ])
  return (
    <div className='min-h-dvh flex app-background'>
      <Sidebar />
      <main className='flex-1'>
        <Header title='Reports & Analytics' />
        <section className='p-4 grid gap-4'>
          <Card>
            <CardHeader title='Analytics' />
            <ReportsSection initialReports={list} initialPayroll={payroll} initialEmployee={employee} initialTax={tax} />
          </Card>
        </section>
      </main>
    </div>
  )
}


