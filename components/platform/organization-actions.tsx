'use client';

import { Organization } from "@/lib/types/organization";
import { Trans } from "@lingui/react/macro";
import { useState } from "react";
import { ApprovalDialog } from "./approval-dialog";
import { ReactivateDialog } from "./reactivate-dialog";

interface OrganizationActionsProps {
  organization: Organization;
}

export function OrganizationActions({ organization }: OrganizationActionsProps) {
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showReactivateDialog, setShowReactivateDialog] = useState(false);

  // Don't show any buttons if organization is already approved and active
  if (organization.approval_status === 'approved' && organization.is_active) {
    return null;
  }

  return (
    <>
      <div className="flex gap-3">
        {/* Show Approve button for pending/rejected organizations */}
        {(organization.approval_status === 'pending' || organization.approval_status === 'rejected') && (
          <button
            onClick={() => setShowApprovalDialog(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <Trans>Approve</Trans>
          </button>
        )}

        {/* Show Reactivate button for suspended/inactive organizations */}
        {!organization.is_active && organization.approval_status === 'approved' && (
          <button
            onClick={() => setShowReactivateDialog(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <Trans>Reactivate</Trans>
          </button>
        )}
      </div>

      {/* Approval Dialog */}
      {showApprovalDialog && (
        <ApprovalDialog
          organization={organization}
          onClose={() => setShowApprovalDialog(false)}
        />
      )}

      {/* Reactivate Dialog */}
      {showReactivateDialog && (
        <ReactivateDialog
          organizationId={organization.id}
          organizationName={organization.name}
          onClose={() => setShowReactivateDialog(false)}
        />
      )}
    </>
  );
}
