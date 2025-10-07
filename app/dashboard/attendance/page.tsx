import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { requireRole } from '@/lib/rbac/server'
import {
  getAttendanceRecords,
  getPendingJustifications,
} from '@/lib/services/attendance'
import { getEmployees } from '@/lib/services/employees'
import { AttendanceSection } from '@/components/attendance/attendance-section'

export default async function AttendancePage() {
  // Only managers and admins can access attendance management
  await requireRole(['operational_manager', 'hr_manager', 'system_admin'])

  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const [attendanceRecords, justifications, employeesData] = await Promise.all([
    getAttendanceRecords({ month: currentMonth }).catch(() => []),
    getPendingJustifications().catch(() => []),
    getEmployees().catch(() => ({ items: [], total: 0 })),
  ])

  const employees = employeesData.items || []

  return (
    <div className="min-h-dvh flex app-background">
      <Sidebar />
      <main className="flex-1">
        <Header title="Attendance Management" />
        <section className="p-4">
          <AttendanceSection
            initialRecords={attendanceRecords}
            initialJustifications={justifications}
            employees={employees.map((emp) => ({
              id: Number(emp.id),
              first_name: emp.first_name,
              last_name: emp.last_name,
            }))}
          />
        </section>
      </main>
    </div>
  )
}
