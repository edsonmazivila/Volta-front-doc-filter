"use client";
import { useState, useMemo } from "react";
import type {
  DocumentListItem,
  DocumentTypeItem,
  Document,
} from "@/lib/services/documents";
import { DocumentCard } from "@/components/my-documents/document-card";
import { UploadDocumentDialog } from "@/components/my-documents/upload-document-dialog";
import { EditDocumentDialog } from "@/components/my-documents/edit-document-dialog";
import { DocumentViewDialog } from "@/components/documents/document-view-dialog";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { deleteDocumentAction, getDocument } from "@/lib/services/documents";
import { SearchInput } from "@/components/search-input";
import { Button } from "@/components/ui";
import { useToastHelpers } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { useLingui } from "@lingui/react";
import { msg } from "@lingui/core/macro";

interface MyDocumentsSectionProps {
  documents: DocumentListItem[];
  employeeId?: string;
  employeeName?: string;
  documentTypes?: DocumentTypeItem[];
}

export function MyDocumentsSection({
  documents,
  employeeId,
  employeeName,
  documentTypes = [],
}: MyDocumentsSectionProps) {
  const router = useRouter();
  const toast = useToastHelpers();
  const { i18n } = useLingui();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] =
    useState<DocumentListItem | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewDocumentId, setViewDocumentId] = useState<string | null>(null);
  const [viewDocument, setViewDocument] = useState<Document | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(null);
  const [deletingDocumentTitle, setDeletingDocumentTitle] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return documents.filter((doc) => {
      const matchesSearch =
        !q ||
        doc.title.toLowerCase().includes(q) ||
        doc.type.toLowerCase().includes(q);
      const matchesType = !typeFilter || doc.type === typeFilter;
      const matchesStatus = !statusFilter || doc.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [documents, search, typeFilter, statusFilter]);


  function handleDeleteClick(id: string, title: string) {
    setDeletingDocumentId(id);
    setDeletingDocumentTitle(title);
    setDeleteDialogOpen(true);
  }

  async function confirmDelete() {
    if (!deletingDocumentId) return;

    setIsDeleting(true);
    try {
      await deleteDocumentAction(deletingDocumentId);
      toast.success(i18n._(msg`Document deleted successfully`));
      setDeleteDialogOpen(false);
      setDeletingDocumentId(null);
      setDeletingDocumentTitle("");
      router.refresh();
    } catch {
      toast.error(i18n._(msg`Failed to delete document`));
    } finally {
      setIsDeleting(false);
    }
  }

  function handleEdit(document: DocumentListItem) {
    setEditingDocument(document);
    setEditDialogOpen(true);
  }

  function handleCloseEditDialog() {
    setEditDialogOpen(false);
    setEditingDocument(null);
  }

  async function handleView(id: string) {
    setViewDocumentId(id);
    setViewDocument(null);
    setViewDialogOpen(true);
    try {
      const data = await getDocument(id);
      setViewDocument(data);
    } catch {
      // Error handling is done in the dialog
    }
  }

  const uniqueTypes = Array.from(new Set(documents.map((d) => d.type)));

  return (
    <div className="space-y-6">
      {/* Employee Info Card */}
      {employeeName && (
        <div className="border border-[var(--border)] rounded-lg p-6 bg-card">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">{employeeName}</h2>
              {employeeId && (
                <p className="text-sm text-muted-foreground mt-1">
                  {i18n._(msg`Employee ID`)}: {employeeId}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">
                {i18n._(msg`Total Documents`)}
              </p>
              <p className="text-3xl font-bold text-blue-600">
                {documents.length}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="border border-[var(--border)] rounded-lg p-4 bg-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">{i18n._(msg`Manage Documents`)}</h3>
          <Button onClick={() => setUploadDialogOpen(true)} size="sm">
            <Upload className="h-4 w-4 mr-1" />
            {i18n._(msg`Upload Document`)}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1">
              {i18n._(msg`Document Type`)}
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full rounded-md border border-[var(--border)] bg-background text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{i18n._(msg`All Types`)}</option>
              {uniqueTypes.map((type) => (
                <option key={type} value={type}>
                  {type
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">{i18n._(msg`Status`)}</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-md border border-[var(--border)] bg-background text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{i18n._(msg`All Statuses`)}</option>
              <option value="approved">{i18n._(msg`Approved`)}</option>
              <option value="pending">{i18n._(msg`Pending`)}</option>
              <option value="rejected">{i18n._(msg`Rejected`)}</option>
              <option value="uploaded">{i18n._(msg`Uploaded`)}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">{i18n._(msg`Search`)}</label>
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder={i18n._(msg`Search documents...`)}
            />
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-[var(--border)] rounded-lg">
          <div className="text-muted-foreground">
            {search || typeFilter || statusFilter
              ? i18n._(msg`No documents match your filters`)
              : i18n._(msg`No documents found`)}
          </div>
          {!search && !typeFilter && !statusFilter && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUploadDialogOpen(true)}
              className="mt-3"
            >
              <Upload className="h-4 w-4 mr-1" />
              {i18n._(msg`Upload Your First Document`)}
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={() => handleDeleteClick(doc.id, doc.title)}
            />
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <UploadDocumentDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        employeeId={employeeId}
        documentTypes={documentTypes}
      />

      {/* Edit Dialog */}
      <EditDocumentDialog
        open={editDialogOpen}
        onOpenChange={handleCloseEditDialog}
        document={editingDocument}
        documentTypes={documentTypes}
      />

      {/* View Dialog */}
      <DocumentViewDialog
        open={viewDialogOpen}
        onOpenChange={(open) => {
          setViewDialogOpen(open);
          if (!open) {
            setViewDocumentId(null);
            setViewDocument(null);
          }
        }}
        document={viewDocument}
        documentId={viewDocumentId}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) {
            setDeletingDocumentId(null);
            setDeletingDocumentTitle("");
          }
        }}
        title={i18n._(msg`Delete Document?`)}
        description={i18n._(msg`Are you sure you want to delete "${deletingDocumentTitle}"? This action cannot be undone.`)}
        confirmText={i18n._(msg`Delete`)}
        cancelText={i18n._(msg`Cancel`)}
        onConfirm={confirmDelete}
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  );
}
