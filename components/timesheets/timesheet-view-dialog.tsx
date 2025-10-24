"use client";

import { useState } from "react";
import { type TimesheetListItem } from "@/lib/services/timesheets";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays,
  Clock,
  FileText,
  CheckCircle,
  XCircle,
  Edit,
} from "lucide-react";
import {
  formatDate,
  formatDateTime,
  formatPayPeriod,
  formatHours,
  getStatusColor,
} from "@/lib/utils";

interface TimesheetViewDialogProps {
  timesheet: TimesheetListItem;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function TimesheetViewDialog({
  timesheet,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: TimesheetViewDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "submitted":
        return <Clock className="h-4 w-4" />;
      case "approved":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      case "draft":
      default:
        return <Edit className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Timesheet Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {timesheet.employeeName}
              </h2>
              <p className="text-muted-foreground">
                {formatPayPeriod(timesheet.pay_period_start || timesheet.periodStart, timesheet.pay_period_end || timesheet.periodEnd)}
              </p>
            </div>
            <Badge
              variant="outline"
              className={getStatusColor(timesheet.status)}
            >
              <div className="flex items-center gap-1">
                {getStatusIcon(timesheet.status)}
                <span className="capitalize">{timesheet.status}</span>
              </div>
            </Badge>
          </div>

          {/* Timesheet Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Period Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Pay Period</p>
                  <p className="text-sm text-muted-foreground">
                    {formatPayPeriod(
                      timesheet.pay_period_start || timesheet.periodStart,
                      timesheet.pay_period_end || timesheet.periodEnd
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium">Start Date</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(timesheet.pay_period_start || timesheet.periodStart)}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium">End Date</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(timesheet.pay_period_end || timesheet.periodEnd)}
                  </p>
                </div>

                {timesheet.submittedAt && (
                  <div>
                    <p className="text-sm font-medium">Submitted At</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(timesheet.submittedAt)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Hours Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Regular Hours</p>
                  <p className="text-sm text-muted-foreground">
                    {formatHours(timesheet.regular_hours || timesheet.regularHours || 0)} hours
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium">Overtime Hours</p>
                  <p className="text-sm text-muted-foreground">
                    {formatHours(timesheet.overtime_hours || timesheet.overtimeHours || 0)} hours
                  </p>
                </div>

                <div className="border-t pt-3">
                  <p className="text-sm font-medium">Total Hours</p>
                  <p className="text-lg font-semibold text-foreground">
                    {formatHours(timesheet.total_hours || timesheet.totalHours || 0)} hours
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          {timesheet.notes && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Notes
              </h3>
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {timesheet.notes}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
