import type { DocumentListItem } from '@/lib/services/documents'

export interface CollaboratorDocumentsGroup {
  collaboratorId: string
  collaboratorName: string
  documents: DocumentListItem[]
}

function normalizeSearch(value: string): string {
  return value.trim().toLowerCase()
}

function normalizeCollaboratorName(value?: string): string {
  const name = String(value || '').trim()
  return name || '—'
}

export function groupDocumentsByCollaborator(
  items: DocumentListItem[],
  collaboratorNameFilter = '',
): CollaboratorDocumentsGroup[] {
  const normalizedFilter = normalizeSearch(collaboratorNameFilter)
  const groupsMap = new Map<string, CollaboratorDocumentsGroup>()

  for (const item of items) {
    const collaboratorName = normalizeCollaboratorName(item.employeeName)

    if (normalizedFilter && !collaboratorName.toLowerCase().includes(normalizedFilter)) {
      continue
    }

    const collaboratorId = String(item.employeeId || '').trim()
    const groupKey = collaboratorId || `name:${collaboratorName.toLowerCase()}`

    if (!groupsMap.has(groupKey)) {
      groupsMap.set(groupKey, {
        collaboratorId: collaboratorId || groupKey,
        collaboratorName,
        documents: [],
      })
    }

    groupsMap.get(groupKey)?.documents.push(item)
  }

  return Array.from(groupsMap.values())
}
