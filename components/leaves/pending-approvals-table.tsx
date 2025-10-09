import { useState } from "react";
import type { LeaveRequestItem } from "@/lib/services/leaves";
import { Button } from "@/components/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, CheckCircle, XCircle } from "lucide-react";
import { LeaveViewDialog } from "./leave-view-dialog";
import { formatDate, formatDateRange } from "@/lib/utils";

interface PendingApprovalsTableProps {
  items: LeaveRequestItem[];
  onApproveL1: (id: string) => Promise<void> | void;
  onApproveFinal: (id: string) => Promise<void> | void;
  onReject: (id: string) => void;
}

export function PendingApprovalsTable({
  items,
  onApproveL1,
  onApproveFinal,
  onReject,
}: PendingApprovalsTableProps) {
  const [viewingLeave, setViewingLeave] = useState<LeaveRequestItem | null>(
    null
  );

  const handleRowClick = (leave: LeaveRequestItem, event: React.MouseEvent) => {
    // Don't open dialog if clicking on interactive elements
    const target = event.target as HTMLElement;
    if (target.closest("button") || target.closest('[role="button"]')) {
      return;
    }
    setViewingLeave(leave);
  };

  const getEmployeeName = (row: LeaveRequestItem) => {
    return (
      `${row.employee_first_name || ""} ${
        row.employee_last_name || ""
      }`.trim() || "—"
    );
  };

  return (
    <>
      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-[var(--border)] text-neutral-400">
              <tr>
                <th className="text-left p-3">
                  <div className="flex items-center gap-2">
                    Employee
                    <span className="text-xs text-muted-foreground">
                      (click to view details)
                    </span>
                  </div>
                </th>
                <th className="text-left p-3">Type</th>
                <th className="text-left p-3">Dates</th>
                <th className="text-left p-3">Days</th>
                <th className="text-left p-3">Reason</th>
                <th className="text-left p-3">Submitted</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td className="p-4" colSpan={7}>
                    No pending approvals found
                  </td>
                </tr>
              ) : (
                items.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-[var(--border)] hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={(event) => handleRowClick(row, event)}
                  >
                    <td className="p-3">{getEmployeeName(row)}</td>
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
                    <td className="p-3">
                      {formatDate(row.submitted_at || row.created_at)}
                    </td>
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
                          {row.status === "SUBMITTED" && (
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
                          {row.status === "APPROVED_L1" && (
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
