'use client';

import { Trans } from "@lingui/react/macro";
import { useState } from "react";
import { suspendOrganizationAction } from "@/lib/actions/platform";
import { useRouter } from "next/navigation";

interface SuspendDialogProps {
  organizationId: string;
  organizationName: string;
  onClose: () => void;
}

export function SuspendDialog({ organizationId, organizationName, onClose }: SuspendDialogProps) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!notes.trim()) {
      setError("Suspension reason is required");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const result = await suspendOrganizationAction(organizationId, notes.trim());
      
      if (!result.success) {
        setError(result.error || "Failed to suspend organization");
        setIsSubmitting(false);
        return;
      }
      
      router.refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to suspend organization");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
            <Trans>Suspend Organization</Trans>
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            {organizationName}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                <Trans>Suspension Reason</Trans> <span className="text-red-500">*</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Explain why this organization is being suspended..."
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                required
              />
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-3">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <Trans>⚠️ This will immediately suspend the organization and block access for all users.</Trans>
              </p>
            </div>
          </div>

          <div className="p-6 border-t border-neutral-200 dark:border-neutral-700 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-700 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trans>Cancel</Trans>
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <Trans>Suspending...</Trans>
                </>
              ) : (
                <Trans>Confirm Suspension</Trans>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
