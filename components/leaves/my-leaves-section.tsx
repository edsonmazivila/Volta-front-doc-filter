"use client";
import { useMemo, useState } from "react";
import type { LeaveRequestItem, LeaveBalanceItem } from "@/lib/services/leaves";
import { LeaveTable } from "@/components/leaves/leave-table";
import { LeaveRequestFormDialog } from "@/components/leaves/leave-request-form-dialog";
import { Button, Skeleton } from "@/components/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useToastHelpers } from "@/components/ui/toast";
import {
  submitLeaveRequestAction,
  cancelLeaveRequestAction,
} from "@/lib/services/leaves";
import { Calendar } from "lucide-react";
import { SearchInput } from "@/components/search-input";

interface MyLeavesSectionProps {
  requests: LeaveRequestItem[];
  balances: LeaveBalanceItem[];
  isLoading?: boolean;
}

export function MyLeavesSection({
  requests,
  balances,
  isLoading = false,
}: MyLeavesSectionProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const router = useRouter();
  const toast = useToastHelpers();
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editItem, setEditItem] = useState<LeaveRequestItem | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewItem, setViewItem] = useState<LeaveRequestItem | null>(null);
  const [operationInProgress, setOperationInProgress] = useState<
    Record<string, boolean>
  >({});

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return requests.filter((r) => {
      const matchesQ =
        !q ||
        [r.leave_type, r.reason, r.status].some((v) =>
          String(v || "")
            .toLowerCase()
            .includes(q)
        );
      const matchesStatus =
        statusFilter === "all" || !statusFilter || r.status === statusFilter;
      const matchesType =
        typeFilter === "all" || !typeFilter || r.leave_type === typeFilter;
      return matchesQ && matchesStatus && matchesType;
    });
  }, [requests, search, statusFilter, typeFilter]);

  return (
    <div className="grid gap-4">
      <div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))
            : balances.map((b) => (
                <div
                  key={b.leave_type}
                  className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-background to-muted/40 p-4 hover:shadow-md transition-colors"
                >
                  <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-[48px] bg-primary/5" />
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {b.leave_type}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-2xl font-semibold">
                      {(b.remaining_days ?? 0).toFixed(1)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      days left
                    </span>
                  </div>
                  {b.pending_days ? (
                    <div className="mt-1 text-xs text-muted-foreground">
                      Pending:{" "}
                      <span className="font-medium">{b.pending_days}</span>
                    </div>
                  ) : null}
                </div>
              ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-sm font-medium">My Leave Requests</h2>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search requests..."
        />
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px] bg-background border border-[var(--border)]">
              <SelectValue placeholder="All status" />
            </SelectTrigger>
            <SelectContent className="bg-background border border-[var(--border)]">
              <SelectItem value="all">All status</SelectItem>
              {[
                "DRAFT",
                "SUBMITTED",
                "APPROVED_L1",
                "APPROVED_FINAL",
                "REJECTED",
                "CANCELLED",
              ].map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[180px] bg-background border border-[var(--border)]">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent className="bg-background border border-[var(--border)]">
              <SelectItem value="all">All types</SelectItem>
              {[
                "vacation",
                "sick",
                "personal",
                "maternity",
                "paternity",
                "bereavement",
                "emergency",
              ].map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={() => {
              setFormMode("create");
              setEditItem(null);
              setFormOpen(true);
            }}
            className="ml-auto"
          >
            New request
          </Button>
        </div>
      </div>

      <LeaveTable
        items={filtered}
        isLoading={isLoading}
        onNew={() => {
          setFormMode("create");
          setEditItem(null);
          setFormOpen(true);
        }}
        onSubmit={async (id) => {
          if (operationInProgress[id]) return;
          setOperationInProgress((prev) => ({ ...prev, [id]: true }));
          try {
            await submitLeaveRequestAction(id);
            toast.success("Submitted");
            router.refresh();
          } catch {
            toast.error("Failed to submit");
          } finally {
            setOperationInProgress((prev) => ({ ...prev, [id]: false }));
          }
        }}
        onCancel={async (id) => {
          if (operationInProgress[id]) return;
          const reason =
            window.prompt("Cancel reason (optional):") || undefined;
          setOperationInProgress((prev) => ({ ...prev, [id]: true }));
          try {
            await cancelLeaveRequestAction(id, reason);
            toast.success("Cancelled");
            router.refresh();
          } catch {
            toast.error("Failed to cancel");
          } finally {
            setOperationInProgress((prev) => ({ ...prev, [id]: false }));
          }
        }}
        onEdit={(id) => {
          const it = requests.find((r) => r.id === id) || null;
          if (it) {
            setEditItem(it);
            setFormMode("edit");
            setFormOpen(true);
          }
        }}
        onDelete={async (id) => {
          if (operationInProgress[id]) return;
          if (!confirm("Are you sure you want to delete this leave request?"))
            return;
          setOperationInProgress((prev) => ({ ...prev, [id]: true }));
          try {
            await cancelLeaveRequestAction(id, "Deleted by user");
            toast.success("Deleted");
            router.refresh();
          } catch {
            toast.error("Failed to delete");
          } finally {
            setOperationInProgress((prev) => ({ ...prev, [id]: false }));
          }
        }}
      />

      {/* Leave Request Form Dialog */}
      <LeaveRequestFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editItem={editItem}
        mode={formMode}
      />

      {/* View Details Dialog */}
      <Dialog
        open={viewOpen}
        onOpenChange={(v) => {
          if (!v) setViewItem(null);
          setViewOpen(v);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave Request Details</DialogTitle>
          </DialogHeader>
          {viewItem ? (
            <div className="grid gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Status:</span>{" "}
                <span className="capitalize">
                  {viewItem.status.toLowerCase()}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Type:</span>{" "}
                <span className="capitalize">{viewItem.leave_type}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Dates:</span>{" "}
                {viewItem.start_date?.slice(0, 10)} -{" "}
                {viewItem.end_date?.slice(0, 10)}
              </div>
              <div>
                <span className="text-muted-foreground">Days:</span>{" "}
                {viewItem.total_days}
                {viewItem.is_half_day ? " (Half Day)" : ""}
              </div>
              <div>
                <span className="text-muted-foreground">Reason:</span>{" "}
                {viewItem.reason || "-"}
              </div>
              <div>
                <span className="text-muted-foreground">Created:</span>{" "}
                {viewItem.created_at?.slice(0, 10) || "-"}
              </div>
              {viewItem.status === "DRAFT" ? (
                <div className="pt-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditItem(viewItem);
                      setFormMode("edit");
                      setFormOpen(true);
                      setViewOpen(false);
                    }}
                  >
                    Edit draft
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
