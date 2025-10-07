"use client";
import { useEffect, useMemo, useState } from "react";
import { DocumentTable } from "@/components/documents/document-table";
import type { DocumentListItem, Document } from "@/lib/services/documents";
import {
  uploadDocumentAction,
  updateDocumentAction,
  deleteDocumentAction,
  approveDocumentAction,
  rejectDocumentAction,
  getDocument,
} from "@/lib/services/documents";
import { Button } from "@/components/ui";
import { useToastHelpers } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SearchInput } from "@/components/search-input";

interface DocumentsSectionProps {
  items: DocumentListItem[];
  initialTypes?: Array<{ type: string, display_name: string }>;
  initialEmployees?: Array<{ id: string, label: string }>;
}

export function DocumentsSection({ items, initialTypes = [], initialEmployees = [] }: DocumentsSectionProps) {
  const toast = useToastHelpers();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [employeeId, setEmployeeId] = useState("");
  const [docType, setDocType] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [confidential, setConfidential] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [employeeOptions, setEmployeeOptions] = useState<
    { id: string; label: string }[]
  >(initialEmployees);
  const [typeOptionsFull, setTypeOptionsFull] = useState<
    { type: string; display_name: string }[]
  >(initialTypes);
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
  const [rejectReason, setRejectReason] = useState("");
  const [uploading, setUploading] = useState(false);
  const [operationInProgress, setOperationInProgress] = useState<Record<string, boolean>>({});

  async function handleUpload() {
    if (!file || !employeeId || !docType) {
      toast.error("Employee, type, and file are required");
      return;
    }
    const form = new FormData();
    form.append("employee_id", employeeId);
    form.append("document_type", docType);
    if (title) form.append("title", title);
    if (description) form.append("description", description);
    if (expiryDate) form.append("expiry_date", expiryDate);
    if (confidential) form.append("is_confidential", "true");
    form.append("file", file);

    setUploading(true);
    try {
      const result = await uploadDocumentAction(null, form);
      if ('errors' in result) {
        toast.error(result.errors._form?.[0] || "Upload failed");
      } else {
        toast.success("Uploaded");
        setOpen(false);
        setFile(null);
        setEmployeeId("");
        setDocType("");
        setTitle("");
        setDescription("");
        setExpiryDate("");
        setConfidential(false);
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  useEffect(() => {
    setEmployeeOptions((prev) => (prev.length ? prev : initialEmployees));
    setTypeOptionsFull((prev) => (prev.length ? prev : initialTypes));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((i) => {
      const matchesQ =
        !q ||
        [i.employeeName, i.title, i.type, i.status].some((v) =>
          String(v || "")
            .toLowerCase()
            .includes(q)
        );
      const matchesType = !typeFilter || i.type === typeFilter;
      const matchesStatus = !statusFilter || i.status === statusFilter;
      return matchesQ && matchesType && matchesStatus;
    });
  }, [items, search, typeFilter, statusFilter]);

  const typeOptions = useMemo(
    () => Array.from(new Set(items.map((i) => i.type).filter(Boolean))).sort(),
    [items]
  );
  const statusOptions = useMemo(
    () =>
      Array.from(new Set(items.map((i) => i.status).filter(Boolean))).sort(),
    [items]
  );

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-sm font-medium">Company Documents</h2>
        <div className="flex items-center gap-2 flex-1 justify-end">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search documents..."
          />
          <select
            className="border rounded-md px-2 py-2 bg-background"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All types</option>
            {typeOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            className="border rounded-md px-2 py-2 bg-background"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All status</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <Button onClick={() => setOpen(true)}>Upload</Button>
        </div>
      </div>
      <DocumentTable
        items={filtered}
        onUpload={() => setOpen(true)}
        onApprove={async (id) => {
          if (operationInProgress[id]) return; // Prevent double-click
          setOperationInProgress(prev => ({ ...prev, [id]: true }));
          try {
            await approveDocumentAction(id);
            toast.success("Approved");
          } catch {
            toast.error("Failed to approve");
          } finally {
            setOperationInProgress(prev => ({ ...prev, [id]: false }));
          }
        }}
        onReject={(id) => {
          if (operationInProgress[id]) return;
          setRejectId(id);
          setRejectReason("");
          setRejectOpen(true);
        }}
        onDelete={async (id) => {
          if (operationInProgress[id]) return; // Prevent double-click
          if (!confirm("Delete document?")) return;
          setOperationInProgress(prev => ({ ...prev, [id]: true }));
          try {
            await deleteDocumentAction(id);
            toast.success("Deleted");
          } catch {
            toast.error("Failed to delete");
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
            const data = await getDocument(id);
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
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm">Employee</label>
              <select
                className="w-full border rounded-md px-3 py-2 bg-background"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
              >
                <option value="">Select employee</option>
                {employeeOptions.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm">Document type</label>
              <select
                className="w-full border rounded-md px-3 py-2 bg-background"
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
              >
                <option value="">Select type</option>
                {typeOptionsFull.map((t) => (
                  <option key={t.type} value={t.type}>
                    {t.display_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm">Title</label>
                <input
                  className="w-full border rounded-md px-3 py-2 bg-background"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm">Expiry Date</label>
                <input
                  type="date"
                  className="w-full border rounded-md px-3 py-2 bg-background"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm">Description</label>
              <textarea
                className="w-full border rounded-md px-3 py-2 bg-background"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm">File</label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="doc-confidential"
                type="checkbox"
                checked={confidential}
                onChange={(e) => setConfidential(e.target.checked)}
              />
              <label htmlFor="doc-confidential" className="text-sm">
                Confidential
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={uploading}>
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View modal */}
      <Dialog
        open={!!viewId}
        onOpenChange={(v) => {
          if (!v) {
            setViewId(null);
            setViewData(null);
          }
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Document</DialogTitle>
            <DialogDescription>
              Preview and download the document.
            </DialogDescription>
          </DialogHeader>
          {viewData ? (
            <div className="grid gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Title:</span>{" "}
                  {viewData.title || "-"}
                </div>
                <div>
                  <span className="text-muted-foreground">Type:</span>{" "}
                  {viewData.document_type}
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>{" "}
                  {viewData.document_status}
                </div>
                <div>
                  <span className="text-muted-foreground">Uploaded:</span>{" "}
                  {viewData.created_at?.slice(0, 10)}
                </div>
              </div>
              <div className="border rounded">
                <iframe
                  className="w-full h-[70vh]"
                  src={`/api/documents/${viewId}/preview`}
                />
              </div>
              <div className="flex justify-end gap-2">
                <a
                  href={`/api/documents/${viewId}/preview`}
                  target="_blank"
                  className="px-3 py-2 border rounded"
                >
                  Preview
                </a>
                <a
                  href={`/api/documents/${viewId}/download`}
                  target="_blank"
                  className="px-3 py-2 bg-primary text-primary-foreground rounded"
                >
                  Download
                </a>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Loading…</div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit metadata dialog */}
      <Dialog
        open={!!editId}
        onOpenChange={(v) => {
          if (!v) {
            setEditId(null);
            setEditData(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
          </DialogHeader>
          {editData ? (
            <div className="grid gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm">Title</label>
                <input
                  className="w-full border rounded-md px-3 py-2 bg-background"
                  value={editData.title}
                  onChange={(e) =>
                    setEditData({ ...editData, title: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm">Description</label>
                <textarea
                  className="w-full border rounded-md px-3 py-2 bg-background"
                  rows={3}
                  value={editData.description}
                  onChange={(e) =>
                    setEditData({ ...editData, description: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm">Expiry Date</label>
                <input
                  type="date"
                  className="w-full border rounded-md px-3 py-2 bg-background"
                  value={editData.expiry_date}
                  onChange={(e) =>
                    setEditData({ ...editData, expiry_date: e.target.value })
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="edit-doc-conf"
                  type="checkbox"
                  checked={editData.is_confidential}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      is_confidential: e.target.checked,
                    })
                  }
                />
                <label htmlFor="edit-doc-conf" className="text-sm">
                  Confidential
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setEditId(null);
                    setEditData(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    if (!editId || !editData || operationInProgress['edit']) return;
                    setOperationInProgress(prev => ({ ...prev, edit: true }));
                    try {
                      const form = new FormData();
                      form.append("title", editData.title);
                      form.append("description", editData.description);
                      form.append("expiry_date", editData.expiry_date);
                      form.append("is_confidential", String(editData.is_confidential));

                      const result = await updateDocumentAction(editId, null, form);
                      if ('errors' in result) {
                        toast.error(result.errors._form?.[0] || "Failed to update");
                      } else {
                        toast.success("Updated");
                        setEditId(null);
                        setEditData(null);
                      }
                    } catch {
                      toast.error("Failed to update");
                    } finally {
                      setOperationInProgress(prev => ({ ...prev, edit: false }));
                    }
                  }}
                  disabled={operationInProgress['edit']}
                >
                  {operationInProgress['edit'] ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Loading…</div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject dialog */}
      <Dialog
        open={rejectOpen}
        onOpenChange={(v) => {
          if (!v) {
            setRejectId(null);
            setRejectReason("");
          }
          setRejectOpen(v);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Document</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <label className="text-sm">Reason</label>
            <textarea
              className="w-full border rounded-md px-3 py-2 bg-background"
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!rejectId || !rejectReason.trim() || operationInProgress['reject']) return;
                setOperationInProgress(prev => ({ ...prev, reject: true }));
                try {
                  const form = new FormData();
                  form.append("reason", rejectReason.trim());

                  const result = await rejectDocumentAction(rejectId, null, form);
                  if ('errors' in result) {
                    toast.error(result.errors._form?.[0] || "Failed to reject");
                  } else {
                    toast.success("Rejected");
                    setRejectOpen(false);
                  }
                } catch {
                  toast.error("Failed to reject");
                } finally {
                  setOperationInProgress(prev => ({ ...prev, reject: false }));
                }
              }}
              disabled={operationInProgress['reject']}
            >
              {operationInProgress['reject'] ? 'Rejecting...' : 'Reject'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
