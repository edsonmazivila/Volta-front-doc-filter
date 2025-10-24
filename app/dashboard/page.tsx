import { Header } from "@/components/dashboard/header";
import { Card, CardHeader } from "@/components/dashboard/card";
import { StatsCard } from "@/components/dashboard/stats-card";
import { PayrollChart } from "@/components/dashboard/payroll-chart";
import { BarChart } from "@/components/dashboard/bar-chart";
import { Button } from "@/components/ui";
import Link from "next/link";
import { getDashboardStats } from "@/lib/services/dashboard";
import { requireUser } from "@/lib/auth/dal";
import { getPayrollRuns } from "@/lib/services/payroll";
import { getTimesheets } from "@/lib/services/timesheets";
import { getUsers } from "@/lib/services/users";
import type { User } from "@/lib/services/users";
import { getMyLeaveRequests } from "@/lib/services/leaves";
import { getMyAttendance } from "@/lib/services/attendance";

export default async function DashboardPage() {
  const user = await requireUser();

  const isEmployee = user.role === 'employee'
  const canViewPayroll = user.role === 'payroll_manager' || user.role === 'system_admin'
  const statsGridCols = canViewPayroll ? 'md:grid-cols-3' : 'md:grid-cols-2'
  const chartsGridCols = canViewPayroll ? 'xl:grid-cols-2' : 'xl:grid-cols-1'
  const managerQuickActionsCols = canViewPayroll ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2'

  // Lazily construct only the needed fetches based on role
  let statsPromise: Promise<{ totalEmployees: number, pendingTimesheets: number, monthlyPayroll: number }>
  let payrollRunsPromise: ReturnType<typeof getPayrollRuns> | Promise<Awaited<ReturnType<typeof getPayrollRuns>>>
  let timesheetsPromise: ReturnType<typeof getTimesheets> | Promise<Awaited<ReturnType<typeof getTimesheets>>>
  let usersPromise: Promise<User[]>
  let leaveRequestsPromise: ReturnType<typeof getMyLeaveRequests> | Promise<Awaited<ReturnType<typeof getMyLeaveRequests>>>
  let myAttendancePromise: ReturnType<typeof getMyAttendance> | Promise<Awaited<ReturnType<typeof getMyAttendance>>>

  if (isEmployee) {
    statsPromise = Promise.resolve({ totalEmployees: 0, pendingTimesheets: 0, monthlyPayroll: 0 })
    payrollRunsPromise = Promise.resolve([])
    timesheetsPromise = getTimesheets().catch(() => [])
    usersPromise = Promise.resolve([])
    leaveRequestsPromise = getMyLeaveRequests().catch(() => [])
    myAttendancePromise = getMyAttendance().catch(() => [])
  } else {
    statsPromise = getDashboardStats().catch(() => ({ totalEmployees: 0, pendingTimesheets: 0, monthlyPayroll: 0 }))
    payrollRunsPromise = getPayrollRuns().catch(() => [])
    timesheetsPromise = getTimesheets().catch(() => [])
    usersPromise = getUsers().catch(() => [])
    leaveRequestsPromise = getMyLeaveRequests().catch(() => [])
    myAttendancePromise = Promise.resolve([])
  }

  const [stats, payrollRuns, timesheets, , leaveRequests, myAttendance] = await Promise.all([
    statsPromise,
    payrollRunsPromise,
    timesheetsPromise,
    usersPromise,
    leaveRequestsPromise,
    myAttendancePromise,
  ])

  // Pending items requiring action
  const pendingLeaves = leaveRequests.filter(l => l.status === 'SUBMITTED').slice(0, 5)
  const pendingTimesheetsCount = stats.pendingTimesheets
  const upcomingPayroll = payrollRuns.find(p => p.status === 'pending' || p.status === 'calculated')

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const timesheetDataByDay = weekDays.map((day, index) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + index);
    const dateStr = date.toISOString().split('T')[0];

    const dayTimesheets = timesheets.filter(t => {
      const periodStart = new Date(t.pay_period_start || t.periodStart).toISOString().split('T')[0];
      const periodEnd = new Date(t.pay_period_end || t.periodEnd).toISOString().split('T')[0];
      return dateStr >= periodStart && dateStr <= periodEnd;
    });

    const totalHours = dayTimesheets.reduce((sum, t) => sum + (t.total_hours || t.totalHours || 0), 0);
    return { name: day, value: totalHours };
  });

  // Employee summaries
  const thisMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
  const presentThisMonth = myAttendance.filter(a => (a.date || '').startsWith(thisMonth) && (a.status === 'present' || a.status === 'late' || a.status === 'half_day')).length
  const lastAttendance = myAttendance[0]
  const pendingMyLeaves = leaveRequests.filter(l => l.status === 'SUBMITTED').length
  const upcomingMyLeaves = leaveRequests.filter(l => {
    const start = new Date(l.start_date)
    return (l.status === 'APPROVED_L1' || l.status === 'APPROVED_FINAL') && start >= new Date()
  }).length

  return (
    <>
      <Header title="Dashboard" />
      <div className="overflow-y-auto">
        {!isEmployee && (
          <section className={`p-4 grid grid-cols-1 ${statsGridCols} gap-4`}>
            <StatsCard label="Total Employees" value={stats.totalEmployees} />
            <StatsCard label="Active Timesheets" value={timesheets.length} />
            {canViewPayroll && (
              <StatsCard label="Monthly Payroll" value={`$${stats.monthlyPayroll.toLocaleString()}`} />
            )}
          </section>
        )}
        {isEmployee && (
          <section className="px-4 pb-4 grid grid-cols-1 lg:grid-cols-2 gap-4 relative z-[1] mt-4">
            <Card className="min-h-[200px]">
              <CardHeader title="My Attendance" />
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="text-sm font-medium">Present this month</div>
                  <span className="text-lg font-semibold">{presentThisMonth}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="text-sm font-medium">Last entry</div>
                  <span className="text-xs sm:text-sm font-medium capitalize">{lastAttendance ? `${lastAttendance.status || '—'} on ${new Date(lastAttendance.date).toLocaleDateString()}` : '—'}</span>
                </div>
              </div>
              <div className="px-4 pb-4">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/my-attendance">View My Attendance</Link>
                </Button>
              </div>
            </Card>

            <Card className="min-h-[200px]">
              <CardHeader title="My Leaves" />
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="text-sm font-medium">Pending requests</div>
                  <span className="text-lg font-semibold">{pendingMyLeaves}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <div className="text-sm font-medium">Upcoming leaves</div>
                  <span className="text-lg font-semibold">{upcomingMyLeaves}</span>
                </div>
              </div>
              <div className="px-4 pb-4">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/my-leaves">View My Leaves</Link>
                </Button>
              </div>
            </Card>
          </section>
        )}
        <section className="px-4 pb-4">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Quick Actions</h2>
          <div className={`grid ${!isEmployee ? managerQuickActionsCols : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'} gap-3`}>
            {isEmployee ? (
              <>
                <Link href="/dashboard/timesheets" className="group">
                  <Card className="h-full transition-all hover:shadow-lg hover:border-blue-500/50 cursor-pointer">
                    <div className="p-4 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors flex-shrink-0">
                        <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground text-sm mb-0.5">Timesheets</h3>
                        <p className="text-xs text-muted-foreground">Submit and track hours</p>
                      </div>
                    </div>
                  </Card>
                </Link>
                <Link href="/dashboard/paystubs" className="group">
                  <Card className="h-full transition-all hover:shadow-lg hover:border-green-500/50 cursor-pointer">
                    <div className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors flex-shrink-0">
                        <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground text-sm mb-0.5">My Paystubs</h3>
                        <p className="text-xs text-muted-foreground">View payment history</p>
                      </div>
                    </div>
                  </Card>
                </Link>
                <Link href="/dashboard/my-documents" className="group">
                  <Card className="h-full transition-all hover:shadow-lg hover:border-purple-500/50 cursor-pointer">
                    <div className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors flex-shrink-0">
                        <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground text-sm mb-0.5">My Documents</h3>
                        <p className="text-xs text-muted-foreground">Access your files</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              </>
            ) : (
              <>
                <Link href="/dashboard/employees" className="group">
                  <Card className="h-full transition-all hover:shadow-lg hover:border-blue-500/50 cursor-pointer">
                    <div className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground text-sm mb-0.5">Manage Employees</h3>
                        <p className="text-xs text-muted-foreground">Add and update members</p>
                      </div>
                    </div>
                  </Card>
                </Link>
                <Link href="/dashboard/timesheets" className="group">
                  <Card className="h-full transition-all hover:shadow-lg hover:border-green-500/50 cursor-pointer">
                    <div className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors flex-shrink-0">
                        <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground text-sm mb-0.5">View Timesheets</h3>
                        <p className="text-xs text-muted-foreground">Review and approve</p>
                      </div>
                    </div>
                  </Card>
                </Link>
                {canViewPayroll && (
                  <Link href="/dashboard/payroll" className="group">
                    <Card className="h-full transition-all hover:shadow-lg hover:border-purple-500/50 cursor-pointer">
                      <div className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors flex-shrink-0">
                          <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground text-sm mb-0.5">Run Payroll</h3>
                          <p className="text-xs text-muted-foreground">Process payments</p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                )}
              </>
            )}
          </div>
        </section>
        {!isEmployee && (
          <section className={`px-4 pb-4 grid grid-cols-1 ${chartsGridCols} gap-4 relative z-[1]`}>
            {canViewPayroll && (
              <Card className="h-[360px] p-0 overflow-hidden">
                <div className="h-full w-full grid grid-rows-[auto,1fr]">
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-sm font-medium">Payroll Totals</span>
                    <Link href="/dashboard/payroll" className="text-xs text-blue-400 hover:underline">View All</Link>
                  </div>
                  <div className="overflow-hidden">
                    <PayrollChart data={payrollRuns} className="w-full h-[300px]" />
                  </div>
                </div>
              </Card>
            )}
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
        {!isEmployee && (
          <section className="px-4 pb-6 grid grid-cols-1 md:grid-cols-2 gap-4 relative z-[1]">
            <Card className="min-h-[200px]">
              <CardHeader title="Pending Approvals" />
              {pendingLeaves.length > 0 || pendingTimesheetsCount > 0 ? (
                <div className="space-y-3">
                  {pendingTimesheetsCount > 0 && (
                    <div className="flex items-center justify-between p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                          <svg className="w-4 h-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{pendingTimesheetsCount} Pending Timesheet{pendingTimesheetsCount !== 1 ? 's' : ''}</p>
                          <p className="text-xs text-muted-foreground">Requires approval</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/dashboard/timesheets">Review</Link>
                      </Button>
                    </div>
                  )}
                  {pendingLeaves.map((leave) => (
                    <div key={leave.id} className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium capitalize">{leave.leave_type} Leave</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/dashboard/leaves">Review</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground py-8 text-center">No pending approvals</div>
              )}
            </Card>

            <Card className="min-h-[200px]">
              <CardHeader title="System Overview" />
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                      <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Upcoming Leaves</p>
                      <p className="text-xs text-muted-foreground">Next 7 days</p>
                    </div>
                  </div>
                  <span className="text-lg font-semibold">
                    {leaveRequests.filter(l => {
                      const startDate = new Date(l.start_date)
                      const today = new Date()
                      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
                      return startDate >= today && startDate <= nextWeek && (l.status === 'APPROVED_L1' || l.status === 'APPROVED_FINAL')
                    }).length}
                  </span>
                </div>

                {canViewPayroll && upcomingPayroll && (
                  <div className="flex items-center justify-between p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Upcoming Payroll</p>
                        <p className="text-xs text-muted-foreground">
                          {upcomingPayroll.payDate ? new Date(upcomingPayroll.payDate).toLocaleDateString() : 'Pending'}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/dashboard/payroll">Process</Link>
                    </Button>
                  </div>
                )}

                {canViewPayroll && (
                <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                      <svg className="w-4 h-4 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Payroll Runs</p>
                      <p className="text-xs text-muted-foreground">This month</p>
                    </div>
                  </div>
                  <span className="text-lg font-semibold">{payrollRuns.length}</span>
                </div>
                )}
              </div>
            </Card>
          </section>
        )}
      </div>
    </>
  );
}
