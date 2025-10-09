"use client";
import { useState, useMemo } from "react";
import type { Paystub } from "@/lib/types/paystubs";
import { PaystubCard } from "@/components/paystubs/paystub-card";
import { PaystubDetailDialog } from "@/components/paystubs/paystub-detail-dialog";
import { SearchInput } from "@/components/search-input";
import { useToastHelpers } from "@/components/ui/toast";

interface PaystubsSectionProps {
  paystubs: Paystub[];
  employeeName?: string;
  employeeInfo?: {
    jobTitle?: string;
    employeeId?: string;
  };
}

export function PaystubsSection({
  paystubs,
  employeeName,
  employeeInfo,
}: PaystubsSectionProps) {
  const toast = useToastHelpers();
  const [search, setSearch] = useState("");
  const [selectedPaystub, setSelectedPaystub] = useState<Paystub | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const filtered = useMemo(() => {
    const list = Array.isArray(paystubs) ? paystubs : [];
    const q = search.trim().toLowerCase();
    if (!q) return list;

    return list.filter((p) => {
      const matchesPayDate = p.pay_date?.toLowerCase().includes(q);
      const matchesPeriod =
        p.pay_period_start?.toLowerCase().includes(q) ||
        p.pay_period_end?.toLowerCase().includes(q);
      const matchesAmount =
        p.net_pay?.toString().includes(q) ||
        p.gross_pay?.toString().includes(q) ||
        p.regular_pay?.toString().includes(q) ||
        p.overtime_pay?.toString().includes(q) ||
        p.bonus_pay?.toString().includes(q) ||
        p.commission_pay?.toString().includes(q);
      const matchesStatus = p.status?.toLowerCase().includes(q);
      const matchesPayrollRun = p.payroll_run_id?.toLowerCase().includes(q);
      return matchesPayDate || matchesPeriod || matchesAmount || matchesStatus || matchesPayrollRun;
    });
  }, [paystubs, search]);

  function handleView(paystub: Paystub) {
    setSelectedPaystub(paystub);
    setDetailDialogOpen(true);
  }

  async function handleDownload(id: string) {
    try {
      // Create a download link
      const link = document.createElement("a");
      link.href = `/api/paystubs/${id}/pdf`;
      link.download = `paystub-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Downloading paystub...");
    } catch {
      toast.error("Failed to download paystub");
    }
  }

  const totalPaystubs = paystubs.length;

  return (
    <div className="space-y-6">
      {/* Employee Info Card */}
      {employeeName && (
        <div className="border border-[var(--border)] rounded-lg p-6 bg-card">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">{employeeName}</h2>
              {employeeInfo?.jobTitle && (
                <p className="text-muted-foreground">{employeeInfo.jobTitle}</p>
              )}
              {employeeInfo?.employeeId && (
                <p className="text-sm text-muted-foreground mt-1">
                  Employee ID: {employeeInfo.employeeId}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">
                Total Paystubs
              </p>
              <p className="text-3xl font-bold text-blue-600">
                {totalPaystubs}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-sm font-medium">Paystub History</h2>
          <p className="text-xs text-muted-foreground mt-1">
            View and download your paystubs
          </p>
        </div>
        <div className="flex-1 max-w-md">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by date or amount..."
          />
        </div>
      </div>

      {/* Paystubs Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-[var(--border)] rounded-lg">
          <div className="text-muted-foreground">
            {search ? "No paystubs match your search" : "No paystubs found"}
          </div>
          {!search && (
            <p className="text-xs text-muted-foreground mt-2">
              Your paystubs will appear here once they are generated
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((paystub) => (
            <PaystubCard
              key={paystub.id}
              paystub={paystub}
              onView={handleView}
              onDownload={handleDownload}
            />
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <PaystubDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        paystub={selectedPaystub}
        onDownload={handleDownload}
      />
    </div>
  );
}
