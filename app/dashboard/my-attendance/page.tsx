import { Header } from '@/components/dashboard/header'
import { requireRole } from '@/lib/rbac/server'
import { getMyAttendance } from '@/lib/services/attendance'
import { MyAttendanceSection } from '@/components/attendance/my-attendance-section'

export default async function MyAttendancePage() {
    await requireRole(['employee','operational_manager','hr_manager','payroll_manager'])
	
	const now = new Date()
	const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
	
	const records = await getMyAttendance(currentMonth).catch(() => [])
	
	return (
		<>
			<Header title='My Attendance' />
			<section className='p-4 grid gap-4 overflow-y-auto'>
				<MyAttendanceSection records={records} />
			</section>
		</>
	)
}

