import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { Card, CardHeader, Stat } from '@/components/dashboard/card'
import { requireUser } from '@/lib/auth/dal'
import { fetchPayrollRuns, fetchPayrollStats } from '@/lib/services/payroll-server'
import { PayrollSection } from '@/components/payroll/payroll-section'

export default async function PayrollPage() {
  await requireUser()
  const [runs, stats] = await Promise.all([fetchPayrollRuns(), fetchPayrollStats()])
  return (
    <div className='min-h-dvh flex app-background'>
      <Sidebar />
      <main className='flex-1'>
        <Header title='Payroll' />
        <section className='p-4 grid gap-4'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <Card><Stat label='Total Employees' value={String(stats.totalEmployees ?? 0)} /></Card>
            <Card><Stat label='Gross Payroll' value={(stats.gross ?? 0).toLocaleString()} /></Card>
            <Card><Stat label='Net Payroll' value={(stats.net ?? 0).toLocaleString()} /></Card>
            <Card><Stat label='Tax Withholding' value={(stats.taxes ?? 0).toLocaleString()} /></Card>
          </div>
          <Card>
            <CardHeader title='Payroll Processing' />
            <PayrollSection runs={runs} />
          </Card>
        </section>
      </main>
    </div>
  )
}


