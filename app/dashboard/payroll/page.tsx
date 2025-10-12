import { Header } from '@/components/dashboard/header'
import { Card, CardHeader, Stat } from '@/components/dashboard/card'
import { requireRole } from '@/lib/rbac/server'
import { getPayrollRuns, getPayrollStats } from '@/lib/services/payroll'
import { PayrollSection } from '@/components/payroll/payroll-section'

export default async function PayrollPage() {
  // Only HR, Payroll managers and admins can access payroll
  await requireRole(['payroll_manager', 'system_admin'])
  const [runs, stats] = await Promise.all([getPayrollRuns(), getPayrollStats()])
  return (
    <>
      <Header title='Payroll' />
      <section className='p-4 grid gap-4 overflow-y-auto'>
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
    </>
  )
}
