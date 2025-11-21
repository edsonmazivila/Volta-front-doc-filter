"use client";

import { useState } from "react";
import {
  AttendanceRecord,
  AttendanceJustification,
} from "@/lib/types/attendance";
import { AttendanceTable } from "./attendance-table";
import { JustificationsTable } from "./justifications-table";
import { AttendanceForm } from "./attendance-form";
import { Button } from "@/components/ui";
import { Card, CardHeader } from "@/components/dashboard/card";
import { exportAttendanceCSV } from "@/lib/services/attendance";
import { toast } from "sonner";
import type { User } from "@/lib/services/users";

interface AttendanceSectionProps {
  initialRecords: AttendanceRecord[];
  initialJustifications: AttendanceJustification[];
  employees: User[];
}

export function AttendanceSection({
  initialRecords,
  initialJustifications,
  employees,
}: AttendanceSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [editRecord, setEditRecord] = useState<AttendanceRecord | undefined>();
  const [exporting, setExporting] = useState(false);

  const handleEdit = (record: AttendanceRecord) => {
    setEditRecord(record);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditRecord(undefined);
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const blob = await exportAttendanceCSV(currentMonth);
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `attendance-${currentMonth}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success("CSV exported successfully");
      } else {
        toast.error("Failed to export CSV");
      }
    } catch {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Records</div>
          <div className="text-2xl font-bold mt-1">{initialRecords.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Present</div>
          <div className="text-2xl font-bold mt-1 text-green-600">
            {initialRecords.filter((r) => r.status === "present").length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Absent</div>
          <div className="text-2xl font-bold mt-1 text-red-600">
            {initialRecords.filter((r) => r.status === "absent").length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">
            Pending Justifications
          </div>
          <div className="text-2xl font-bold mt-1 text-yellow-600">
            {initialJustifications.filter((j) => j.status === "pending" || j.status === "justified").length}
          </div>
        </Card>
      </div>

      {/* Attendance Records */}
      <Card>
        <CardHeader title="Attendance Records" />
        <div className="flex gap-2 flex-col sm:flex-row sm:items-center justify-end my-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={exporting}
          >
            {exporting ? "Exporting..." : "Export CSV"}
          </Button>
          <Button size="sm" onClick={() => setShowForm(true)}>
            + Record Attendance
          </Button>
        </div>
        {showForm && (
          <div className="border-b border-border p-6 bg-muted/30">
            <h3 className="text-lg font-semibold mb-4">
              {editRecord ? "Edit Attendance" : "Record Attendance"}
            </h3>
            <AttendanceForm
              employees={employees}
              editRecord={editRecord}
              onSuccess={handleFormSuccess}
              onCancel={() => {
                setShowForm(false);
                setEditRecord(undefined);
              }}
            />
          </div>
        )}

        <AttendanceTable records={initialRecords} onEdit={handleEdit} />
      </Card>

      {/* Pending Justifications */}
      {initialJustifications.length > 0 && (
        <Card>
          <CardHeader title="Pending Justifications" />
          <JustificationsTable justifications={initialJustifications} />
        </Card>
      )}
    </div>
  );
}
