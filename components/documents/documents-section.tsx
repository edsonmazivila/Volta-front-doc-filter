"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DocumentTable } from "@/components/documents/document-table";
import { DocumentUploadFormDialog } from "@/components/documents/document-upload-form-dialog";
import { DocumentViewDialog } from "@/components/documents/document-view-dialog";
import { DocumentEditDialog } from "@/components/documents/document-edit-dialog";
import { DocumentRejectDialog } from "@/components/documents/document-reject-dialog";
import type { DocumentListItem, Document } from "@/lib/services/documents";
import {
  deleteDocumentAction,
  approveDocumentAction,
  getDocument,
  getDocumentForEdit,
} from "@/lib/services/documents";
import { Button } from "@/components/ui";
import { useToastHelpers } from "@/components/ui/toast";
import { SearchInput } from "@/components/search-input";
import { groupDocumentsByCollaborator } from "@/lib/utils/document-grouping";
import { useLingui } from '@lingui/react';
import { msg } from '@lingui/core/macro';

interface DocumentsSectionProps {
  items: DocumentListItem[];
  initialTypes?: Array<{ type: string, display_name: string }>;
  initialEmployees?: Array<{ id: string, label: string }>;
}

export function DocumentsSection({ items, initialTypes = [], initialEmployees = [] }: DocumentsSectionProps) {
  const { i18n } = useLingui();
  const toast = useToastHelpers();
  const router = useRouter();
  const [search, setSearch] = useState("");
  
  // Dialog states
  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewId, setViewId] = useState<string | null>(null);
  const [viewData, setViewData] = useState<Document | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<{
    title: string;
    description: string;
    expiry_date: string;
    is_confidential: boolean;
  } | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  
  const [operationInProgress, setOperationInProgress] = useState<Record<string, boolean>>({});
  
  const [employeeOptions, setEmployeeOptions] = useState<
    { id: string; label: string }[]
  >(initialEmployees);
  const [typeOptionsFull, setTypeOptionsFull] = useState<
    { type: string; display_name: string }[]
  >(initialTypes);

  useEffect(() => {
    setEmployeeOptions((prev) => (prev.length ? prev : initialEmployees));
    setTypeOptionsFull((prev) => (prev.length ? prev : initialTypes));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const groupedDocuments = useMemo(
    () => groupDocumentsByCollaborator(items, search),
    [items, search],
  );

  const hasDocuments = items.length > 0;
  const hasFilteredGroups = groupedDocuments.length > 0;



  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-sm font-medium">{i18n._(msg`Company Documents`)}</h2>
        <div className="flex items-center gap-2 flex-1 justify-end">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder={i18n._(msg`Search collaborator...`)}
          />
          <Button onClick={() => setUploadOpen(true)}>{i18n._(msg`Upload`)}</Button>
        </div>
      </div>
      {!hasFilteredGroups ? (
        <div className="glass rounded-xl p-6 text-sm text-muted-foreground">
          {hasDocuments
            ? i18n._(msg`No collaborators match this search`)
            : i18n._(msg`No documents found`)}
        </div>
      ) : (
        <div className="grid gap-4">
          {groupedDocuments.map((group) => (
            <section key={group.collaboratorId} className="grid gap-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">{group.collaboratorName}</h3>
                <span className="text-xs text-muted-foreground">
                  {group.documents.length} {i18n._(msg`documents`)}
                </span>
              </div>
              <DocumentTable
                items={group.documents}
                hideEmployeeColumn
                onApprove={async (id) => {
                  if (operationInProgress[id]) return; // Prevent double-click
                  setOperationInProgress(prev => ({ ...prev, [id]: true }));
                  try {
                    await approveDocumentAction(id);
                    toast.success(i18n._(msg`Approved`));
                    router.refresh();
                  } catch {
                    toast.error(i18n._(msg`Failed to approve`));
                  } finally {
                    setOperationInProgress(prev => ({ ...prev, [id]: false }));
                  }
                }}
                onReject={(id) => {
                  if (operationInProgress[id]) return;
                  setRejectId(id);
                  setRejectOpen(true);
                }}
                onDelete={async (id) => {
                  if (operationInProgress[id]) return; // Prevent double-click
                  if (!confirm(i18n._(msg`Delete document?`))) return;
                  setOperationInProgress(prev => ({ ...prev, [id]: true }));
                  try {
                    await deleteDocumentAction(id);
                    toast.success(i18n._(msg`Deleted`));
                  } catch {
                    toast.error(i18n._(msg`Failed to delete`));
                  } finally {
                    setOperationInProgress(prev => ({ ...prev, [id]: false }));
                  }
                }}
                onView={async (id) => {
                  setViewId(id);
                  setViewData(null);
                  try {
                    const data = await getDocument(id);
                    setViewData(data);
                  } catch {}
                }}
                onEdit={async (id) => {
                  setEditId(id);
                  try {
                    const data = await getDocumentForEdit(id);
                    setEditData({
                      title: data?.title || "",
                      description: data?.description || "",
                      expiry_date: data?.expiry_date
                        ? String(data.expiry_date).slice(0, 10)
                        : "",
                      is_confidential: !!data?.is_confidential,
                    });
                  } catch {
                    setEditData({
                      title: "",
                      description: "",
                      expiry_date: "",
                      is_confidential: false,
                    });
                  }
                }}
              />
            </section>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <DocumentUploadFormDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        employees={employeeOptions}
        documentTypes={typeOptionsFull}
      />

      {/* View Dialog */}
      <DocumentViewDialog
        open={!!viewId}
        onOpenChange={(v) => {
          if (!v) {
            setViewId(null);
            setViewData(null);
          }
        }}
        document={viewData}
        documentId={viewId}
      />

      {/* Edit Dialog */}
      <DocumentEditDialog
        open={!!editId}
        onOpenChange={(v) => {
          if (!v) {
            setEditId(null);
            setEditData(null);
          }
        }}
        documentId={editId}
        initialData={editData}
      />

      {/* Reject Dialog */}
      <DocumentRejectDialog
        open={rejectOpen}
        onOpenChange={(v) => {
          if (!v) {
            setRejectId(null);
          }
          setRejectOpen(v);
        }}
        documentId={rejectId}
      />
    </div>
  );
}
