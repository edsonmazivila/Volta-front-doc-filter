import { Header } from '@/components/dashboard/header'
import { verifySession } from '@/lib/auth/dal'
import { requireRole } from '@/lib/rbac/server'
import { getMyDocuments, getDocumentTypes } from '@/lib/services/documents'
import { MyDocumentsSection } from '@/components/my-documents/my-documents-section'
import { t } from '@lingui/core/macro'
import { getLocaleAndInitialize } from '@/lib/i18n/server'

export const metadata = {
  title: 'My Documents - Volta HR',
  description: 'View and manage your personal documents',
}

export default async function MyDocumentsPage() {
  await getLocaleAndInitialize()
  await requireRole(['employee','operational_manager','hr_manager','payroll_manager','organization_admin','system_admin'])
  const session = await verifySession()

  const [documents, documentTypes] = await Promise.all([
    getMyDocuments(),
    getDocumentTypes(),
  ])

  return (
    <>
      <Header title={t`My Documents`} />
      <section className="p-4 overflow-y-auto">
        <MyDocumentsSection
          documents={documents}
          employeeId={session?.user?.id}
          employeeName={session?.user?.full_name}
          documentTypes={documentTypes}
        />
      </section>
    </>
  )
}
