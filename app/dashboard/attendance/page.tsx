import { Header } from '@/components/dashboard/header'
import { requireRole } from '@/lib/rbac/server'
import {
  getAttendanceRecords,
  getPendingJustifications,
} from '@/lib/services/attendance'
import { getUsers } from '@/lib/services/users'
import { AttendanceSection } from '@/components/attendance/attendance-section'
import { t } from '@lingui/core/macro'
import { getLocaleAndInitialize } from '@/lib/i18n/server'

export default async function AttendancePage() {
  await getLocaleAndInitialize()
  await requireRole(['operational_manager', 'hr_manager', 'system_admin', 'organization_admin'])

  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const [attendanceRecords, justifications, users] = await Promise.all([
    getAttendanceRecords({ month: currentMonth }).catch(() => []),
    getPendingJustifications().catch(() => []),
    getUsers().catch(() => []),
  ])

  // Show all users
  const employees = users

  return (
    <>
      <Header title={t`Attendance Management`} />
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
