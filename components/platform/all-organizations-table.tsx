'use client';

import { Organization } from "@/lib/types/organization";
import { Trans } from "@lingui/react/macro";
import Link from "next/link";
import { useState } from "react";
import { ApprovalDialog } from "./approval-dialog";
import { RejectDialog } from "./reject-dialog";
import { SuspendDialog } from "./suspend-dialog";
import { ReactivateDialog } from "./reactivate-dialog";

interface AllOrganizationsTableProps {
  organizations: Organization[];
}

export function AllOrganizationsTable({ organizations }: AllOrganizationsTableProps) {
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [dialogType, setDialogType] = useState<'approve' | 'reject' | 'suspend' | 'reactivate' | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
            <Trans>Approved</Trans>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
            <Trans>Pending</Trans>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
            <Trans>Rejected</Trans>
          </span>
        );
      default:
        return null;
    }
  };

  if (organizations.length === 0) {
    return (
      <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
        <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <p className="text-lg font-medium">
          <Trans>No organizations found</Trans>
        </p>
        <p className="text-sm mt-1">
          <Trans>Organizations will appear here once they register</Trans>
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-neutral-200 dark:border-neutral-700">
            <th className="text-left py-3 px-4 font-semibold text-sm text-neutral-700 dark:text-neutral-300">
              <Trans>Organization</Trans>
            </th>
            <th className="text-left py-3 px-4 font-semibold text-sm text-neutral-700 dark:text-neutral-300">
              <Trans>Status</Trans>
            </th>
            <th className="text-left py-3 px-4 font-semibold text-sm text-neutral-700 dark:text-neutral-300">
              <Trans>Tier</Trans>
            </th>
            <th className="text-left py-3 px-4 font-semibold text-sm text-neutral-700 dark:text-neutral-300">
              <Trans>Companies</Trans>
            </th>
            <th className="text-left py-3 px-4 font-semibold text-sm text-neutral-700 dark:text-neutral-300">
              <Trans>Users</Trans>
            </th>
            <th className="text-left py-3 px-4 font-semibold text-sm text-neutral-700 dark:text-neutral-300">
              <Trans>Created</Trans>
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
                <div className="flex items-center gap-2">
                  {getStatusBadge(org.approval_status)}
                  {!org.is_active && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300">
                      <Trans>Suspended</Trans>
                    </span>
                  )}
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
              <td className="py-4 px-4 text-sm text-neutral-700 dark:text-neutral-300">
                {org.companies_count || 0}
              </td>
              <td className="py-4 px-4 text-sm text-neutral-700 dark:text-neutral-300">
                {org.users_count || 0}
              </td>
              <td className="py-4 px-4 text-sm text-neutral-700 dark:text-neutral-300">
                {formatDate(org.created_at)}
              </td>
              <td className="py-4 px-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  {org.approval_status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedOrg(org);
                          setDialogType('approve');
                        }}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                      >
                        <Trans>Approve</Trans>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedOrg(org);
                          setDialogType('reject');
                        }}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      >
                        <Trans>Reject</Trans>
                      </button>
                    </>
                  )}
                  {org.approval_status === 'approved' && org.is_active && (
                    <button
                      onClick={() => {
                        setSelectedOrg(org);
                        setDialogType('suspend');
                      }}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
                    >
                      <Trans>Suspend</Trans>
                    </button>
                  )}
                  {!org.is_active && org.approval_status !== 'pending' && org.approval_status !== 'rejected' && (
                    <button
                      onClick={() => {
                        setSelectedOrg(org);
                        setDialogType('reactivate');
                      }}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                    >
                      <Trans>Reactivate</Trans>
                    </button>
                  )}
                  <Link
                    href={`/platform/organizations/${org.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  >
                    <Trans>View</Trans>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Dialogs */}
      {dialogType === 'approve' && selectedOrg && (
        <ApprovalDialog
          organization={selectedOrg}
          onClose={() => {
            setSelectedOrg(null);
            setDialogType(null);
          }}
        />
      )}
      {dialogType === 'reject' && selectedOrg && (
        <RejectDialog
          organization={selectedOrg}
          onClose={() => {
            setSelectedOrg(null);
            setDialogType(null);
          }}
        />
      )}
      {dialogType === 'suspend' && selectedOrg && (
        <SuspendDialog
          organizationId={selectedOrg.id}
          organizationName={selectedOrg.name}
          onClose={() => {
            setSelectedOrg(null);
            setDialogType(null);
          }}
        />
      )}
      {dialogType === 'reactivate' && selectedOrg && (
        <ReactivateDialog
          organizationId={selectedOrg.id}
          organizationName={selectedOrg.name}
          onClose={() => {
            setSelectedOrg(null);
            setDialogType(null);
          }}
        />
      )}
    </div>
  );
}
