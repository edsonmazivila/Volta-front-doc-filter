import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { requireUser, verifySession } from '@/lib/auth/dal'
import { getMyDocuments, getDocumentTypes } from '@/lib/services/documents'
import { MyDocumentsSection } from '@/components/my-documents/my-documents-section'

export const metadata = {
  title: 'My Documents - NexuPayroll',
  description: 'View and manage your personal documents',
}

export default async function MyDocumentsPage() {
  await requireUser()
  const session = await verifySession()

  const [documents, documentTypes] = await Promise.all([
    getMyDocuments(),
    getDocumentTypes(),
  ])

  return (
    <div className="min-h-dvh flex app-background">
      <Sidebar />
      <main className="flex-1">
        <Header title="My Documents" />
        <section className="p-4">
          <MyDocumentsSection
            documents={documents}
            employeeId={session?.user?.id}
            employeeName={session?.user?.name}
            documentTypes={documentTypes}
          />
        </section>
      </main>
    </div>
  )
}
