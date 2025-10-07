import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { Card, CardHeader } from "@/components/dashboard/card";
import { StatsCard } from "@/components/dashboard/stats-card";
import { LineChartPlaceholder } from "@/components/dashboard/line-chart";
import { BarChart } from "@/components/dashboard/bar-chart";
import { Button } from "@/components/ui";
import Link from "next/link";
import { getDashboardStats } from "@/lib/services/dashboard";
import { requireUser } from "@/lib/auth/dal";
import { getPayrollRuns } from "@/lib/services/payroll";
import { getTimesheets } from "@/lib/services/timesheets";
import { getEmployees } from "@/lib/services/employees";
import type { Employee } from "@/lib/services/employees";
import { getMyLeaveRequests } from "@/lib/services/leaves";

export default async function DashboardPage() {
  const user = await requireUser();

  const isEmployee = user.role === 'employee'

  // Lazily construct only the needed fetches based on role
  let statsPromise: Promise<{ totalEmployees: number, pendingTimesheets: number, monthlyPayroll: number }>
  let payrollRunsPromise: ReturnType<typeof getPayrollRuns> | Promise<Awaited<ReturnType<typeof getPayrollRuns>>>
  let timesheetsPromise: ReturnType<typeof getTimesheets> | Promise<Awaited<ReturnType<typeof getTimesheets>>>
  let employeesPromise: Promise<{ items: Employee[], total: number }>
  let leaveRequestsPromise: ReturnType<typeof getMyLeaveRequests> | Promise<Awaited<ReturnType<typeof getMyLeaveRequests>>>

  if (isEmployee) {
    statsPromise = Promise.resolve({ totalEmployees: 0, pendingTimesheets: 0, monthlyPayroll: 0 })
    payrollRunsPromise = Promise.resolve([])
    timesheetsPromise = getTimesheets().catch(() => [])
    employeesPromise = Promise.resolve({ items: [], total: 0 })
    leaveRequestsPromise = getMyLeaveRequests().catch(() => [])
  } else {
    statsPromise = getDashboardStats().catch(() => ({ totalEmployees: 0, pendingTimesheets: 0, monthlyPayroll: 0 }))
    payrollRunsPromise = getPayrollRuns().catch(() => [])
    timesheetsPromise = getTimesheets().catch(() => [])
    employeesPromise = getEmployees().catch(() => ({ items: [], total: 0 }))
    leaveRequestsPromise = getMyLeaveRequests().catch(() => [])
  }

  const [stats, payrollRuns, timesheets, employeesData, leaveRequests] = await Promise.all([
    statsPromise,
    payrollRunsPromise,
    timesheetsPromise,
    employeesPromise,
    leaveRequestsPromise,
  ])

  const employees = employeesData.items || []

  const recentActivities = [
    ...employees.slice(0, 2).map(e => ({
      id: `emp-${e.id}`,
      text: `New employee: ${e.first_name} ${e.last_name}`,
      time: e.created_at,
    })),
    ...leaveRequests.slice(0, 2).map(l => ({
      id: `leave-${l.id}`,
      text: `Leave ${l.status}: ${l.leave_type}`,
      time: l.start_date,
    })),
    ...payrollRuns.slice(0, 1).map(p => ({
      id: `payroll-${p.id}`,
      text: `Payroll: $${(p.netAmount || 0).toLocaleString()}`,
      time: p.periodEnd || p.periodStart,
    })),
  ].sort((a, b) => new Date(b.time || 0).getTime() - new Date(a.time || 0).getTime()).slice(0, 5);

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const timesheetDataByDay = weekDays.map((day, index) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + index);
    const dateStr = date.toISOString().split('T')[0];

    const dayTimesheets = timesheets.filter(t => {
      const periodStart = new Date(t.periodStart).toISOString().split('T')[0];
      const periodEnd = new Date(t.periodEnd).toISOString().split('T')[0];
      return dateStr >= periodStart && dateStr <= periodEnd;
    });

    const totalHours = dayTimesheets.reduce((sum, t) => sum + (t.totalHours || 0), 0);
    return { name: day, value: totalHours };
  });

  return (
    <div className="min-h-dvh flex app-background">
      <Sidebar />
      <main className="flex-1">
        <Header title="Dashboard" />
        {!isEmployee && (
          <section className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatsCard label="Total Employees" value={stats.totalEmployees} />
            <StatsCard label="Pending Timesheets" value={stats.pendingTimesheets} />
            <StatsCard label="Monthly Payroll" value={`$${stats.monthlyPayroll.toLocaleString()}`} />
          </section>
        )}
        <section className="px-4 pb-4 grid grid-cols-1 gap-4">
          <Card>
            <CardHeader title="Quick Actions" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {isEmployee ? (
                <>
                  <Button variant="secondary" asChild>
                    <Link href="/dashboard/my-timesheets">My Timesheets</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/dashboard/paystubs">My Paystubs</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/dashboard/my-documents">My Documents</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild>
                    <Link href="/dashboard/employees">Manage Employees</Link>
                  </Button>
                  <Button variant="secondary" asChild>
                    <Link href="/dashboard/timesheets">View Timesheets</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/dashboard/payroll">Run Payroll</Link>
                  </Button>
                </>
              )}
            </div>
          </Card>
        </section>
        {!isEmployee && (
          <section className="px-4 pb-4 grid grid-cols-1 xl:grid-cols-2 gap-4 relative z-[1]">
            <Card className="h-[360px] p-0 overflow-hidden">
              <div className="h-full w-full grid grid-rows-[auto,1fr]">
                <div className="p-4 flex items-center justify-between">
                  <span className="text-sm font-medium">Payroll Trends</span>
                  <Link href="/dashboard/payroll" className="text-xs text-blue-400 hover:underline">View All</Link>
                </div>
                <div className="px-2 pb-2">
                  <LineChartPlaceholder className="w-full h-[280px]" />
                </div>
              </div>
            </Card>
            <Card className="h-[360px] p-0 overflow-hidden">
              <div className="h-full w-full grid grid-rows-[auto,1fr]">
                <div className="p-4 flex items-center justify-between">
                  <span className="text-sm font-medium">This Week&apos;s Hours</span>
                  <Link href="/dashboard/timesheets" className="text-xs text-blue-400 hover:underline">View All</Link>
                </div>
                <div className="pb-2">
                  <BarChart data={timesheetDataByDay} />
                </div>
              </div>
            </Card>
          </section>
        )}
        <section className="px-4 pb-6 grid grid-cols-1 gap-4 relative z-[1]">
          <Card className="min-h-[200px]">
            <CardHeader title="Recent Activity" />
            {recentActivities.length > 0 ? (
              <ul className="space-y-3 text-sm">
                {recentActivities.map((activity) => (
                  <li key={activity.id} className="flex items-start gap-3 text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                    <div className="flex-1">
                      <p>{activity.text}</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        {new Date(activity.time || 0).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-muted-foreground py-8 text-center">No recent activity</div>
            )}
          </Card>
        </section>
      </main>
    </div>
  );
}
