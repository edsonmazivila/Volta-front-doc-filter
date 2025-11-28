import { Header } from '@/components/dashboard/header'
import { Card, CardHeader } from '@/components/dashboard/card'
import { requireRole } from '@/lib/rbac/server'
import { getDocuments, getDocumentTypes } from '@/lib/services/documents'
import { getUsers } from '@/lib/services/users'
import { DocumentsSection } from '@/components/documents/documents-section'
import { t } from '@lingui/core/macro'

export default async function DocumentsPage() {
  await requireRole(['hr_manager', 'system_admin'])
  const [items, types, users] = await Promise.all([
    getDocuments(),
    getDocumentTypes(),
    getUsers(),
  ])

  // Show all users
  const employees = users.map(e => ({
    id: e.id,
    label: e.full_name || e.email || e.id
  }))

  return (
    <>
      <Header title={t`Documents`} />
      <section className='p-4 grid gap-4 overflow-y-auto'>
        <Card>
          <CardHeader title={t`Library`} />
          <DocumentsSection items={items} initialTypes={types} initialEmployees={employees} />
        </Card>
      </section>
    </>
  )
}
