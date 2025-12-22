'use client';

import { Organization } from "@/lib/types/organization";
import { Trans } from "@lingui/react/macro";
import { useState } from "react";
import { ApprovalDialog } from "./approval-dialog";
import { RejectDialog } from "./reject-dialog";

interface PendingOrganizationsTableProps {
  organizations: Organization[];
}

export function PendingOrganizationsTable({ organizations }: PendingOrganizationsTableProps) {
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [dialogType, setDialogType] = useState<'approve' | 'reject' | null>(null);

  const handleApprove = (org: Organization) => {
    setSelectedOrg(org);
    setDialogType('approve');
  };

  const handleReject = (org: Organization) => {
    setSelectedOrg(org);
    setDialogType('reject');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (organizations.length === 0) {
    return (
      <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
        <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-lg font-medium">
          <Trans>No pending organizations</Trans>
        </p>
        <p className="text-sm mt-1">
          <Trans>All organizations have been reviewed</Trans>
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-700">
              <th className="text-left py-3 px-4 font-semibold text-sm text-neutral-700 dark:text-neutral-300">
                <Trans>Organization</Trans>
              </th>
              <th className="text-left py-3 px-4 font-semibold text-sm text-neutral-700 dark:text-neutral-300">
                <Trans>Tier</Trans>
              </th>
              <th className="text-left py-3 px-4 font-semibold text-sm text-neutral-700 dark:text-neutral-300">
                <Trans>Status</Trans>
              </th>
              <th className="text-left py-3 px-4 font-semibold text-sm text-neutral-700 dark:text-neutral-300">
                <Trans>Requested</Trans>
              </th>
              <th className="text-right py-3 px-4 font-semibold text-sm text-neutral-700 dark:text-neutral-300">
                <Trans>Actions</Trans>
              </th>
            </tr>
          </thead>
          <tbody>
            {organizations.map((org) => (
              <tr key={org.id} className="border-b border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                <td className="py-4 px-4">
                  <div>
                    <div className="font-medium text-neutral-900 dark:text-white">
                      {org.name}
                    </div>
                    <div className="text-sm text-neutral-500 dark:text-neutral-400">
                      {org.tier.charAt(0).toUpperCase() + org.tier.slice(1)} Plan
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    org.tier === 'enterprise' 
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                      : org.tier === 'premium'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  }`}>
                    {org.tier.charAt(0).toUpperCase() + org.tier.slice(1)}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                    <Trans>Pending</Trans>
                  </span>
                </td>
                <td className="py-4 px-4 text-sm text-neutral-700 dark:text-neutral-300">
                  {formatDate(org.created_at)}
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleApprove(org)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <Trans>Approve</Trans>
                    </button>
                    <button
                      onClick={() => handleReject(org)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <Trans>Reject</Trans>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrg && dialogType === 'approve' && (
        <ApprovalDialog
          organization={selectedOrg}
          onClose={() => {
            setSelectedOrg(null);
            setDialogType(null);
          }}
        />
      )}

      {selectedOrg && dialogType === 'reject' && (
        <RejectDialog
          organization={selectedOrg}
          onClose={() => {
            setSelectedOrg(null);
            setDialogType(null);
          }}
        />
      )}
    </>
  );
}
