"use client";
import { useMemo, useState } from "react";
import type { LeaveRequestItem } from "@/lib/services/leaves";
import { Button, Skeleton } from "@/components/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Eye,
  Edit,
  Clock,
  XCircle,
  CheckCircle,
} from "lucide-react";
import { LeaveViewDialog } from "./leave-view-dialog";
import { formatDate, formatDateRange, getLeaveStatusColor } from "@/lib/utils";

interface LeaveTableProps {
  items?: LeaveRequestItem[];
  isLoading?: boolean;
  onNew?: () => void;
  onSubmit?: (id: string) => void;
  onCancel?: (id: string) => void;
  onEdit?: (id: string) => void;
  onApproveL1?: (id: string) => void;
  onApproveFinal?: (id: string) => void;
  onReject?: (id: string) => void;
}

export function LeaveTable({
  items = [],
  isLoading = false,
  onNew,
  onSubmit,
  onCancel,
  onEdit,
  onApproveL1,
  onApproveFinal,
  onReject,
}: LeaveTableProps) {
  const rows = useMemo(() => items, [items]);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [viewingLeave, setViewingLeave] = useState<LeaveRequestItem | null>(
    null
  );

  const getEmployeeName = (row: LeaveRequestItem) => {
    return row.employee_full_name || "—";
  };

  const handleRowClick = (leave: LeaveRequestItem, event: React.MouseEvent) => {
    // Don't open dialog if clicking on interactive elements
    const target = event.target as HTMLElement;
    if (target.closest("button") || target.closest('[role="button"]')) {
      return;
    }
    setViewingLeave(leave);
  };

  if (isLoading) {
    return (
      <div className="glass rounded-xl overflow-hidden">
        <div className="p-6 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10" />
          ))}
        </div>
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="glass rounded-xl overflow-hidden">
        <div className="p-6 text-center text-sm text-muted-foreground">
          No leave requests found
          {onNew ? (
            <div className="mt-3">
              <Button onClick={onNew}>New request</Button>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-[var(--border)] text-neutral-400">
              <tr>
                <th className="text-left p-3">Employee</th>
                <th className="text-left p-3">
                  <div className="flex items-center gap-2">
                    Status
                    <span className="text-xs text-muted-foreground">
                      (click to view details)
                    </span>
                  </div>
                </th>
                <th className="text-left p-3">Type</th>
                <th className="text-left p-3">Dates</th>
                <th className="text-left p-3">Days</th>
                <th className="text-left p-3">Reason</th>
                <th className="text-left p-3">Created</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td className="p-4" colSpan={8}>
                    No leave requests found
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-[var(--border)] hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={(event) => handleRowClick(row, event)}
                  >
                    <td className="p-3">{getEmployeeName(row)}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getLeaveStatusColor(
                          row.status
                        )}`}
                      >
                        {row.status.toLowerCase().replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-3 capitalize">{row.leave_type}</td>
                    <td className="p-3">
                      {formatDateRange(row.start_date, row.end_date)}
                    </td>
                    <td className="p-3">
                      {row.total_days}
                      {row.is_half_day ? " (Half Day)" : ""}
                    </td>
                    <td
                      className="p-3 max-w-[240px] truncate"
                      title={row.reason || ""}
                    >
                      {row.reason || "-"}
                    </td>
                    <td className="p-3">{formatDate(row.created_at)}</td>
                    <td className="p-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(event) => event.stopPropagation()}
                            className="h-8 w-8 p-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(event) => {
                              event.stopPropagation();
                              setViewingLeave(row);
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {row.status === "SUBMITTED" && onApproveL1 && (
                            <DropdownMenuItem
                              onClick={(event) => {
                                event.stopPropagation();
                                onApproveL1(row.id);
                              }}
                              className="text-green-400 focus:text-green-400"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Approve L1
                            </DropdownMenuItem>
                          )}
                          {row.status === "APPROVED_L1" && onApproveFinal && (
                            <DropdownMenuItem
                              onClick={(event) => {
                                event.stopPropagation();
                                onApproveFinal(row.id);
                              }}
                              className="text-green-400 focus:text-green-400"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Approve Final
                            </DropdownMenuItem>
                          )}
                          {onEdit && (
                            <DropdownMenuItem
                              onClick={(event) => {
                                event.stopPropagation();
                                onEdit(row.id);
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                          )}
                          {row.status === "DRAFT" && onSubmit && (
                            <DropdownMenuItem
                              onClick={(event) => {
                                event.stopPropagation();
                                setPendingId(row.id);
                                onSubmit(row.id);
                                setPendingId(null);
                              }}
                              disabled={pendingId === row.id}
                            >
                              <Clock className="mr-2 h-4 w-4" />
                              Submit
                            </DropdownMenuItem>
                          )}
                          {["DRAFT", "SUBMITTED", "APPROVED_L1"].includes(
                            row.status
                          ) &&
                            onCancel && (
                              <DropdownMenuItem
                                onClick={(event) => {
                                  event.stopPropagation();
                                  onCancel(row.id);
                                }}
                                disabled={pendingId === row.id}
                                className="text-yellow-400 focus:text-yellow-400"
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Cancel
                              </DropdownMenuItem>
                            )}
                          {["SUBMITTED", "APPROVED_L1"].includes(row.status) &&
                            onReject && (
                              <DropdownMenuItem
                                onClick={(event) => {
                                  event.stopPropagation();
                                  onReject(row.id);
                                }}
                                className="text-red-400 focus:text-red-400"
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Reject
                              </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leave View Dialog */}
      {viewingLeave && (
        <LeaveViewDialog
          leave={viewingLeave}
          open={!!viewingLeave}
          onOpenChange={(open) => !open && setViewingLeave(null)}
        />
      )}
    </>
  );
}
