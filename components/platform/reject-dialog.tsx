'use client';

import { Organization } from "@/lib/types/organization";
import { Trans } from "@lingui/react/macro";
import { useState } from "react";
import { rejectOrganizationAction } from "@/lib/actions/platform";
import { useRouter } from "next/navigation";

interface RejectDialogProps {
  organization: Organization;
  onClose: () => void;
}

export function RejectDialog({ organization, onClose }: RejectDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const router = useRouter();

  const handleReject = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await rejectOrganizationAction(organization.id, reason.trim());
      if (result.success) {
        router.refresh();
        onClose();
      } else {
        setError(result.error || 'Failed to reject organization');
      }
    } catch (err) {
      console.error('[RejectDialog] Failed to reject organization:', err);
      setError(err instanceof Error ? err.message : 'Failed to reject organization');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
                <Trans>Reject Organization</Trans>
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                <Trans>You are about to reject the following organization:</Trans>
              </p>
            </div>
          </div>

          {/* Organization Details */}
          <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4 mb-4 space-y-2">
            <div>
              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">
                <Trans>Organization Name</Trans>
              </span>
              <p className="text-sm font-medium text-neutral-900 dark:text-white">
                {organization.name}
              </p>
            </div>
            <div>
              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">
                <Trans>Tier</Trans>
              </span>
              <p className="text-sm font-medium text-neutral-900 dark:text-white capitalize">
                {organization.tier}
              </p>
            </div>
          </div>

          {/* Rejection Reason */}
          <div className="mb-4">
            <label htmlFor="rejection-reason" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              <Trans>Reason for Rejection</Trans> <span className="text-red-600 dark:text-red-400">*</span>
            </label>
            <textarea
              id="rejection-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="Please provide a clear reason for rejecting this organization..."
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-transparent resize-none"
              disabled={isSubmitting}
            />
          </div>

          {/* Warning */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium text-red-900 dark:text-red-300 mb-2">
              <Trans>Warning: This action will:</Trans>
            </h4>
            <ul className="space-y-1.5 text-sm text-red-800 dark:text-red-400">
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span><Trans>Set organization status to &quot;Rejected&quot;</Trans></span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span><Trans>Prevent admin user from logging in</Trans></span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span><Trans>Send rejection notification with your reason</Trans></span>
              </li>
            </ul>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-600 transition-colors disabled:opacity-50"
            >
              <Trans>Cancel</Trans>
            </button>
            <button
              onClick={handleReject}
              disabled={isSubmitting || !reason.trim()}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <Trans>Rejecting...</Trans>
                </>
              ) : (
                <Trans>Reject Organization</Trans>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
