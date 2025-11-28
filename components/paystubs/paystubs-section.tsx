"use client";
import { useState } from "react";
import type { Paystub } from "@/lib/types/paystubs";
import { PaystubCard } from "@/components/paystubs/paystub-card";
import { PaystubDetailDialog } from "@/components/paystubs/paystub-detail-dialog";
import { useToastHelpers } from "@/components/ui/toast";
import { useLingui } from "@lingui/react";
import { msg } from "@lingui/core/macro";

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
  const { i18n } = useLingui();
  const [selectedPaystub, setSelectedPaystub] = useState<Paystub | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

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
      toast.success(i18n._(msg`Downloading paystub...`));
    } catch {
      toast.error(i18n._(msg`Failed to download paystub`));
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
                  {i18n._(msg`Employee ID`)}: {employeeInfo.employeeId}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">
                {i18n._(msg`Total Paystubs`)}
              </p>
              <p className="text-3xl font-bold text-blue-600">
                {totalPaystubs}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Paystub History Header */}
      <div>
        <h2 className="text-lg font-medium">{i18n._(msg`Paystub History`)}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {i18n._(msg`View and download your paystubs`)}
        </p>
      </div>

      {/* Paystubs Grid */}
      {paystubs.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-[var(--border)] rounded-lg">
          <div className="text-muted-foreground">
            {i18n._(msg`No paystubs found`)}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {i18n._(msg`Your paystubs will appear here once they are generated`)}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paystubs.map((paystub) => (
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
