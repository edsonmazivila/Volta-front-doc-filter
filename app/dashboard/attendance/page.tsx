import { Header } from '@/components/dashboard/header'
import { requireRole } from '@/lib/rbac/server'
import {
  getAttendanceRecords,
  getPendingJustifications,
} from '@/lib/services/attendance'
import { getUsers } from '@/lib/services/users'
import { AttendanceSection } from '@/components/attendance/attendance-section'

export default async function AttendancePage() {
  await requireRole(['operational_manager', 'hr_manager', 'system_admin'])

  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const [attendanceRecords, justifications, users] = await Promise.all([
    getAttendanceRecords({ month: currentMonth }).catch(() => []),
    getPendingJustifications().catch(() => []),
    getUsers().catch(() => []),
  ])

  // Filter for employees only
  const employees = users.filter(u => u.is_employee)

  return (
    <>
      <Header title="Attendance Management" />
      <section className="p-4 overflow-y-auto">
        <AttendanceSection
          initialRecords={attendanceRecords}
          initialJustifications={justifications}
          employees={employees}
        />
      </section>
    </>
  )
}
