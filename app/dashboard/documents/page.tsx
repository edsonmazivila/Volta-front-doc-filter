import { Header } from '@/components/dashboard/header'
import { Card, CardHeader } from '@/components/dashboard/card'
import { requireRole } from '@/lib/rbac/server'
import { getDocuments, getDocumentTypes } from '@/lib/services/documents'
import { getEmployees } from '@/lib/services/employees'
import { DocumentsSection } from '@/components/documents/documents-section'

export default async function DocumentsPage() {
  // Only managers and admins can access document management
  await requireRole(['operational_manager', 'hr_manager', 'payroll_manager', 'system_admin'])
  const [items, types, employeesData] = await Promise.all([
    getDocuments(),
    getDocumentTypes(),
    getEmployees({ page: 1, pageSize: 50 }),
  ])

  const employees = employeesData.items.map(e => ({
    id: e.id,
    label: `${e.first_name || ''} ${e.last_name || ''}`.trim() || e.email || e.id
  }))

  return (
    <>
      <Header title='Documents' />
      <section className='p-4 grid gap-4 overflow-y-auto'>
        <Card>
          <CardHeader title='Library' />
          <DocumentsSection items={items} initialTypes={types} initialEmployees={employees} />
        </Card>
      </section>
    </>
  )
}
