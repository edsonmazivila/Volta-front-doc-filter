'use client';

import { Trans } from "@lingui/react/macro";
import Link from "next/link";
import type { User } from "@/lib/services/users";

interface CompanyUsersTableProps {
  users: User[];
  companyId: string;
}

export function CompanyUsersTable({ users, companyId }: CompanyUsersTableProps) {
  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      system_admin: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      hr_manager: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      payroll_manager: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      operational_manager: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400',
      employee: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-900/20 dark:text-neutral-400',
    };
    return colors[role] || colors.employee;
  };

  const formatRole = (role: string) => {
    const roles: Record<string, string> = {
      system_admin: 'System Admin',
      hr_manager: 'HR Manager',
      payroll_manager: 'Payroll Manager',
      operational_manager: 'Operations Manager',
      employee: 'Employee',
    };
    return roles[role] || role;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (users.length === 0) {
    return null; // Parent component handles empty state
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-neutral-200 dark:border-neutral-700">
            <th className="text-left py-3 px-4 font-semibold text-sm text-neutral-700 dark:text-neutral-300">
              <Trans>Name</Trans>
            </th>
            <th className="text-left py-3 px-4 font-semibold text-sm text-neutral-700 dark:text-neutral-300">
              <Trans>Email</Trans>
            </th>
            <th className="text-left py-3 px-4 font-semibold text-sm text-neutral-700 dark:text-neutral-300">
              <Trans>Role</Trans>
            </th>
            <th className="text-left py-3 px-4 font-semibold text-sm text-neutral-700 dark:text-neutral-300">
              <Trans>Status</Trans>
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
          {users.map((user) => (
            <tr key={user.id} className="border-b border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
              <td className="py-4 px-4">
                <div className="font-medium text-neutral-900 dark:text-white">
                  {user.full_name}
                </div>
              </td>
              <td className="py-4 px-4 text-sm text-neutral-700 dark:text-neutral-300">
                {user.email}
              </td>
              <td className="py-4 px-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                  {formatRole(user.role)}
                </span>
              </td>
              <td className="py-4 px-4">
                {user.is_active ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    <Trans>Active</Trans>
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                    <Trans>Inactive</Trans>
                  </span>
                )}
              </td>
              <td className="py-4 px-4 text-sm text-neutral-700 dark:text-neutral-300">
                {formatDate(user.created_at)}
              </td>
              <td className="py-4 px-4 text-right">
                <Link
                  href={`/dashboard/organization/companies/${companyId}/users/${user.id}/edit`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                >
                  <Trans>Edit</Trans>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
