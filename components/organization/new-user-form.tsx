'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trans } from "@lingui/react/macro";
import { Button } from "@/components/ui";
import Link from "next/link";
import { createUserForCompanyAction } from "@/lib/actions/organization-users";

interface NewUserFormProps {
  companyId: string;
  companyName: string;
  defaultRole?: string;
}

export function NewUserForm({ companyId, companyName, defaultRole }: NewUserFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    role: defaultRole || "employee",
    can_login: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const result = await createUserForCompanyAction({
        ...formData,
        company_id: companyId,
      });
      
      if (!result.success) {
        setError(result.error || "Failed to create user");
        setIsSubmitting(false);
        return;
      }
      
      router.push(`/dashboard/organization/companies/${companyId}/users?success=created`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow">
      <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
          <Trans>Create New User</Trans>
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
          <Trans>Add a new user to {companyName}</Trans>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            <Trans>Full Name</Trans> <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            placeholder="John Doe"
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            <Trans>Email</Trans> <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="john@example.com"
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            <Trans>Role</Trans> <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="system_admin">System Admin</option>
            <option value="hr_manager">HR Manager</option>
            <option value="payroll_manager">Payroll Manager</option>
            <option value="operational_manager">Operations Manager</option>
            <option value="employee">Employee</option>
          </select>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {formData.role === 'system_admin' && (
              <Trans>⭐ System Admin can manage this company independently</Trans>
            )}
            {formData.role === 'hr_manager' && (
              <Trans>Manages employees, departments, and leave policies</Trans>
            )}
            {formData.role === 'payroll_manager' && (
              <Trans>Processes payroll and manages compensation</Trans>
            )}
            {formData.role === 'operational_manager' && (
              <Trans>Manages timesheets and approvals</Trans>
            )}
            {formData.role === 'employee' && (
              <Trans>Regular employee with self-service access</Trans>
            )}
          </p>
        </div>

        {/* Can Login Toggle */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="can_login"
            checked={formData.can_login}
            onChange={(e) => setFormData({ ...formData, can_login: e.target.checked })}
            className="mt-1 w-4 h-4 text-blue-600 border-neutral-300 rounded focus:ring-blue-500"
          />
          <div>
            <label htmlFor="can_login" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              <Trans>Allow system login</Trans>
            </label>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              <Trans>User can login to access the platform. Disable for contractors or inactive users.</Trans>
            </p>
          </div>
        </div>

        {/* Password (only if can_login is true) */}
        {formData.can_login && (
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              <Trans>Password</Trans> <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required={formData.can_login}
              minLength={8}
            />
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              <Trans>Minimum 8 characters</Trans>
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-neutral-200 dark:border-neutral-700">
          <Link href={`/dashboard/organization/companies/${companyId}/users`}>
            <Button variant="outline" disabled={isSubmitting}>
              <Trans>Cancel</Trans>
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <Trans>Creating...</Trans>
              </>
            ) : (
              <Trans>Create User</Trans>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
