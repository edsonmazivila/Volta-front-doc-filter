"use client";

import { useState } from "react";
import { type LeaveRequestItem } from "@/lib/services/leaves";
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
  Calendar,
  AlertCircle,
} from "lucide-react";
import {
  formatDate,
  formatDateTime,
  formatDateRange,
  getLeaveStatusColor,
} from "@/lib/utils";
import { useLingui } from '@lingui/react';
import { msg } from '@lingui/core/macro';

interface LeaveViewDialogProps {
  leave: LeaveRequestItem;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function LeaveViewDialog({
  leave,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: LeaveViewDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case "SUBMITTED":
        return <Clock className="h-4 w-4" />;
      case "APPROVED":
        return <CheckCircle className="h-4 w-4" />;
      case "REJECTED":
        return <XCircle className="h-4 w-4" />;
      case "CANCELLED":
        return <AlertCircle className="h-4 w-4" />;
      case "DRAFT":
      default:
        return <Edit className="h-4 w-4" />;
    }
  };

  const getEmployeeName = () => {
    return leave.employee_full_name || i18n._(msg`Employee`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {i18n._(msg`Leave Request Details`)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {getEmployeeName()}
              </h2>
              <p className="text-muted-foreground capitalize">
                {leave.leave_type} {i18n._(msg`Leave`)}
              </p>
            </div>
            <Badge
              variant="outline"
              className={getLeaveStatusColor(leave.status)}
            >
              <div className="flex items-center gap-1">
                {getStatusIcon(leave.status)}
                <span className="capitalize">
                  {leave.status.toLowerCase().replace("_", " ")}
                </span>
              </div>
            </Badge>
          </div>

          {/* Leave Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                {i18n._(msg`Leave Details`)}
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">{i18n._(msg`Leave Type`)}</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {leave.leave_type}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium">{i18n._(msg`Date Range`)}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDateRange(leave.start_date, leave.end_date)}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium">{i18n._(msg`Start Date`)}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(leave.start_date)}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium">{i18n._(msg`End Date`)}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(leave.end_date)}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {i18n._(msg`Duration & Status`)}
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">{i18n._(msg`Total Days`)}</p>
                  <p className="text-lg font-semibold text-foreground">
                    {leave.total_days}{" "}
                    {leave.is_half_day ? i18n._(msg`(Half Day)`) : i18n._(msg`day(s)`)}
                  </p>
                </div>
                {typeof leave.total_hours === 'number' && (
                  <div>
                    <p className="text-sm font-medium">{i18n._(msg`Total Hours`)}</p>
                    <p className="text-sm text-muted-foreground">{leave.total_hours}</p>
                  </div>
                )}

                {leave.created_at && (
                  <div>
                    <p className="text-sm font-medium">{i18n._(msg`Created`)}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(leave.created_at)}
                    </p>
                  </div>
                )}

                {leave.submitted_at && (
                  <div>
                    <p className="text-sm font-medium">{i18n._(msg`Submitted`)}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(leave.submitted_at)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reason Section */}
          {leave.reason && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {i18n._(msg`Reason`)}
              </h3>
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {leave.reason}
                </p>
              </div>
            </div>
          )}

          {/* Approval Section */}
          {leave.status === 'APPROVED' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                {i18n._(msg`Approval Details`)}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {leave.approved_at && (
                  <div>
                    <p className="text-sm font-medium">{i18n._(msg`Approved At`)}</p>
                    <p className="text-sm text-muted-foreground">{formatDateTime(leave.approved_at)}</p>
                  </div>
                )}
                {leave.approved_notes && (
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium">{i18n._(msg`Notes`)}</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{leave.approved_notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>
              {i18n._(msg`Close`)}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
