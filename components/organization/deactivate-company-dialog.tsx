"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { Trans } from "@lingui/react/macro";
import { deactivateCompanyAction } from "@/lib/actions/companies";

interface DeactivateCompanyDialogProps {
  companyId: string;
  companyName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function DeactivateCompanyDialog({
  companyId,
  companyName,
  isOpen,
  onClose,
}: DeactivateCompanyDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleDeactivate() {
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await deactivateCompanyAction(companyId);
      
      if (!result.success) {
        setError(result.error || "Failed to deactivate company");
        setIsSubmitting(false);
        return;
      }
      
      router.push(`/dashboard/organization?success=company_deactivated&name=${encodeURIComponent(companyName)}`);
      router.refresh();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to deactivate company";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-white dark:bg-neutral-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600 dark:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">
              <Trans>Deactivate Company</Trans>
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              <Trans>
                Are you sure you want to deactivate <strong>{companyName}</strong>? This will:
              </Trans>
            </p>
            <ul className="list-disc list-inside text-sm text-neutral-600 dark:text-neutral-400 space-y-1 mb-4">
              <li><Trans>Prevent employees from logging in</Trans></li>
              <li><Trans>Stop all payroll processing</Trans></li>
              <li><Trans>Disable access to company resources</Trans></li>
            </ul>
            <p className="text-sm text-neutral-500 dark:text-neutral-500">
              <Trans>You can reactivate the company later if needed.</Trans>
            </p>

            {error && (
              <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1"
          >
            <Trans>Cancel</Trans>
          </Button>
          <Button
            onClick={handleDeactivate}
            disabled={isSubmitting}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            {isSubmitting ? <Trans>Deactivating...</Trans> : <Trans>Deactivate Company</Trans>}
          </Button>
        </div>
      </div>
    </div>
  );
}
