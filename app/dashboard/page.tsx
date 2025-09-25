import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { Card, CardHeader } from '@/components/dashboard/card'
import { StatsCard } from '@/components/dashboard/stats-card'
import { LineChartPlaceholder } from '@/components/dashboard/line-chart'
import { BarChart } from '@/components/dashboard/bar-chart'
import { Button, Skeleton } from '@/components/ui'
import Link from 'next/link'
import { fetchDashboardStats } from '@/lib/services/dashboard'

import { requireUser } from '@/lib/auth/dal'

export default async function DashboardPage() {
  await requireUser()
  const stats = await fetchDashboardStats()
  return (
    <div className="min-h-dvh flex app-background">
      <Sidebar />
      <main className="flex-1">
        <Header title="Dashboard" />
        <section className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard label="Total Employees" value={stats.TotalEmployees} />
          <StatsCard label="Pending Timesheets" value={stats.PendingTimesheets} />
          <StatsCard label="Monthly Payroll" value={`$${stats.MonthlyPayroll.toLocaleString()}`} />
        </section>
        <section className="px-4 pb-4 grid grid-cols-1 gap-4">
          <Card>
            <CardHeader title="Quick Actions" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Button asChild>
                <Link href="/employees/new">Add Employee</Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link href="/timesheets/new">Create Timesheet</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/payroll/run">Run Payroll</Link>
              </Button>
            </div>
          </Card>
        </section>
        <section className="px-4 pb-4 grid grid-cols-1 xl:grid-cols-2 gap-4 relative z-[1]">
          <Card className="h-[360px] p-0 overflow-hidden">
            <div className="h-full w-full grid grid-rows-[auto,1fr]">
              <div className="p-4 flex items-center justify-between">
                <span className="text-sm font-medium">Payroll Trends</span>
              </div>
              <div className="px-2 pb-2">
                <LineChartPlaceholder className="w-full h-[280px]" />
              </div>
            </div>
          </Card>
          <Card className="h-[360px] p-0 overflow-hidden">
            <div className="h-full w-full grid grid-rows-[auto,1fr]">
              <div className="p-4 flex items-center justify-between">
                <span className="text-sm font-medium">Timesheets Overview</span>
              </div>
              <div className="pb-2">
                <BarChart data={[{ name: 'Mon', value: 12 }, { name: 'Tue', value: 18 }, { name: 'Wed', value: 9 }, { name: 'Thu', value: 21 }, { name: 'Fri', value: 15 }]} />
              </div>
            </div>
          </Card>
        </section>
        <section className="px-4 pb-6 grid grid-cols-1 gap-4 relative z-[1]">
          <Card className="h-[360px]">
            <CardHeader title="Recent Activity" />
            <ul className="space-y-3 text-sm muted-text">
              <li><Skeleton className="h-6" /></li>
              <li><Skeleton className="h-6" /></li>
              <li><Skeleton className="h-6" /></li>
            </ul>
          </Card>
        </section>
      </main>
    </div>
  );
}


