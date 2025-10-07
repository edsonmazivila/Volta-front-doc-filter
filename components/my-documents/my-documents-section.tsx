"use client";
import { useState, useMemo } from "react";
import type {
  DocumentListItem,
  DocumentTypeItem,
} from "@/lib/services/documents";
import { DocumentCard } from "@/components/my-documents/document-card";
import { UploadDocumentDialog } from "@/components/my-documents/upload-document-dialog";
import { deleteDocumentAction } from "@/lib/services/documents";
import { SearchInput } from "@/components/search-input";
import { Button } from "@/components/ui";
import { useToastHelpers } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";

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
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

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

  async function handleDownload(id: string) {
    try {
      const link = document.createElement("a");
      link.href = `/api/documents/${id}/download`;
      link.download = `document-${id}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Downloading document...");
    } catch {
      toast.error("Failed to download document");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      await deleteDocumentAction(id);
      toast.success("Document deleted");
      router.refresh();
    } catch {
      toast.error("Failed to delete document");
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
                  Employee ID: {employeeId}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">
                Total Documents
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
          <h3 className="text-sm font-semibold">Manage Documents</h3>
          <Button onClick={() => setUploadDialogOpen(true)} size="sm">
            <Upload className="h-4 w-4 mr-1" />
            Upload Document
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1">
              Document Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full rounded-md border border-[var(--border)] bg-background text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
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
            <label className="block text-xs font-medium mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-md border border-[var(--border)] bg-background text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
              <option value="uploaded">Uploaded</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Search</label>
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search documents..."
            />
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-[var(--border)] rounded-lg">
          <div className="text-muted-foreground">
            {search || typeFilter || statusFilter
              ? "No documents match your filters"
              : "No documents found"}
          </div>
          {!search && !typeFilter && !statusFilter && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUploadDialogOpen(true)}
              className="mt-3"
            >
              <Upload className="h-4 w-4 mr-1" />
              Upload Your First Document
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onDownload={handleDownload}
              onDelete={handleDelete}
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
    </div>
  );
}
