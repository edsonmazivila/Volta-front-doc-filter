import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { Card, CardHeader, Stat } from '@/components/dashboard/card'
import { LineChartPlaceholder } from '@/components/dashboard/line-chart'
import { Skeleton } from '@/components/ui'

export default function DashboardPage() {
  return (
    <div className="min-h-dvh flex app-background">
      <Sidebar />
      <main className="flex-1">
        <Header title="Dashboard" />
        <section className="p-4 card-grid relative z-[1]">
          <Card>
            <Stat label="Total Employees" value={'—'} />
          </Card>
          <Card>
            <Stat label="Active" value={'—'} />
          </Card>
          <Card>
            <Stat label="Inactive" value={'—'} />
          </Card>
          <Card>
            <Stat label="Pending Payments" value={'—'} />
          </Card>
        </section>
        <section className="px-4 pb-6 grid grid-cols-1 xl:grid-cols-3 gap-4 relative z-[1]">
          <Card className="xl:col-span-2 h-[360px] p-0 overflow-hidden">
            <div className="h-full w-full grid grid-rows-[auto,1fr]">
              <div className="p-4 flex items-center justify-between">
                <span className="text-sm font-medium">Payroll Trends</span>
              </div>
              <div className="px-2 pb-2">
                <LineChartPlaceholder className="w-full h-[280px]" />
              </div>
            </div>
          </Card>
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


