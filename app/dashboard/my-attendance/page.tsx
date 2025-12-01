import { Header } from '@/components/dashboard/header'
import { requireRole } from '@/lib/rbac/server'
import { getMyAttendance, getMyJustifications } from '@/lib/services/attendance'
import { MyAttendanceSection } from '@/components/attendance/my-attendance-section'
import { t } from '@lingui/core/macro'
import { getLocaleAndInitialize } from '@/lib/i18n/server'

export default async function MyAttendancePage() {
	await getLocaleAndInitialize()
	await requireRole(['employee','operational_manager','hr_manager','payroll_manager'])

	const now = new Date()
	const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

	// Fetch both attendance records and justifications
	const [records, justifications] = await Promise.all([
		getMyAttendance(currentMonth).catch(() => []),
		getMyJustifications(currentMonth).catch(() => [])
	])

	// Merge justification document data into attendance records
	const enrichedRecords = records.map(record => {
		const justification = justifications.find(j => j.date === record.date.split('T')[0])
		if (justification && (justification.document_url || justification.document_filename)) {
			return {
				...record,
				justification_document_url: justification.document_url,
				justification_document_filename: justification.document_filename
			}
		}
		return record
	})

	return (
		<>
			<Header title={t`My Attendance`} />
			<section className='p-4 grid gap-4 overflow-y-auto'>
				<MyAttendanceSection records={enrichedRecords} />
			</section>
		</>
	)
}

