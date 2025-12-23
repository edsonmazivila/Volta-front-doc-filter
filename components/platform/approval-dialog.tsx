'use client';

import { Organization, OrganizationTier } from "@/lib/types/organization";
import { Trans } from "@lingui/react/macro";
import { useState } from "react";
import { approveOrganizationAction } from "@/lib/actions/platform";
import { useRouter } from "next/navigation";

interface ApprovalDialogProps {
  organization: Organization;
  onClose: () => void;
}

export function ApprovalDialog({ organization, onClose }: ApprovalDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [tier, setTier] = useState<OrganizationTier>(organization.tier || 'standard');
  const router = useRouter();

  const handleApprove = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await approveOrganizationAction(organization.id, { notes, tier });
      if (result.success) {
        router.refresh();
        onClose();
      } else {
        setError(result.error || 'Failed to approve organization');
      }
    } catch (err) {
      console.error('[ApprovalDialog] Failed to approve organization:', err);
      setError(err instanceof Error ? err.message : 'Failed to approve organization');
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
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
                <Trans>Approve Organization</Trans>
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                <Trans>You are about to approve the following organization:</Trans>
              </p>
            </div>
          </div>

          {/* Organization Details */}
          <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4 mb-4 space-y-3">
            <div>
              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">
                <Trans>Organization Name</Trans>
              </span>
              <p className="text-sm font-medium text-neutral-900 dark:text-white">
                {organization.name}
              </p>
            </div>
            
            {/* Tier Selection */}
            <div>
              <label htmlFor="tier" className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase mb-1.5">
                <Trans>Subscription Tier</Trans>
              </label>
              <select
                id="tier"
                value={tier}
                onChange={(e) => setTier(e.target.value as OrganizationTier)}
                disabled={isSubmitting}
                className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
              >
                <option value="standard"><Trans>Standard</Trans></option>
                <option value="premium"><Trans>Premium</Trans></option>
                <option value="enterprise"><Trans>Enterprise</Trans></option>
              </select>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                <Trans>Select the tier for this organization</Trans>
              </p>
            </div>

            {/* Approval Notes */}
            <div>
              <label htmlFor="notes" className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase mb-1.5">
                <Trans>Approval Notes (Optional)</Trans>
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isSubmitting}
                rows={3}
                placeholder="Add any notes about this approval..."
                className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 resize-none"
              />
            </div>
          </div>

          {/* What will happen */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
              <Trans>What will happen:</Trans>
            </h4>
            <ul className="space-y-1.5 text-sm text-blue-800 dark:text-blue-400">
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span><Trans>Organization status will be set to &quot;Approved&quot;</Trans></span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span><Trans>Organization will become active</Trans></span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span><Trans>Admin user will be able to log in</Trans></span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span><Trans>Organization can start creating companies and users</Trans></span>
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
              onClick={handleApprove}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <Trans>Approving...</Trans>
                </>
              ) : (
                <Trans>Approve Organization</Trans>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
