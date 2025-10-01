import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { Card, CardHeader } from '@/components/dashboard/card'
import { requireUser } from '@/lib/auth/dal'
import { fetchDocuments, fetchDocumentTypes } from '@/lib/services/documents-server'
import { fetchEmployees } from '@/lib/services/employees-server'
import { DocumentsSection } from '@/components/documents/documents-section'

export default async function DocumentsPage() {
  await requireUser()
  const [items, types, employees] = await Promise.all([
    fetchDocuments(),
    fetchDocumentTypes(),
    fetchEmployees({ page: 1, pageSize: 50 }).then(({ items }) => items.map(e => ({ id: e.id, label: `${e.first_name || ''} ${e.last_name || ''}`.trim() || e.email || e.id }))),
  ])
  return (
    <div className='min-h-dvh flex app-background'>
      <Sidebar />
      <main className='flex-1'>
        <Header title='Documents' />
        <section className='p-4 grid gap-4'>
          <Card>
            <CardHeader title='Library' />
            <DocumentsSection items={items} initialTypes={types} initialEmployees={employees} />
          </Card>
        </section>
      </main>
    </div>
  )
}


