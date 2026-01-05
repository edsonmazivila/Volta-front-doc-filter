'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trans } from "@lingui/react/macro";
import { Button } from "@/components/ui";
import Link from "next/link";
import { updateUserAction } from "@/lib/actions/organization-users";

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  can_login: boolean;
  is_active: boolean;
}

interface EditUserFormProps {
  userId: string;
  companyId: string;
  user: User;
}

export function EditUserForm({ userId, companyId, user }: EditUserFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    full_name: user.full_name,
    email: user.email,
    role: user.role,
    can_login: user.can_login,
    is_active: user.is_active,
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const result = await updateUserAction(userId, {
        ...formData,
        password: formData.password || undefined, // Only send if changed
      });
      
      if (!result.success) {
        setError(result.error || "Failed to update user");
        setIsSubmitting(false);
        return;
      }
      
      router.push(`/dashboard/organization/companies/${companyId}/users?success=updated`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow">
      <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
          <Trans>Edit User</Trans>
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
          <Trans>Update user information</Trans>
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
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
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
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
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
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
            required
          >
            <option value="employee">Employee</option>
            <option value="system_admin">System Admin</option>
            <option value="hr_manager">HR Manager</option>
            <option value="payroll_manager">Payroll Manager</option>
            <option value="operational_manager">Operational Manager</option>
          </select>
        </div>

        {/* Password (optional) */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            <Trans>New Password</Trans> <span className="text-neutral-500">(leave blank to keep current)</span>
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="••••••••"
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
          />
        </div>

        {/* Can Login */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="can_login"
            checked={formData.can_login}
            onChange={(e) => setFormData({ ...formData, can_login: e.target.checked })}
            className="w-4 h-4"
          />
          <label htmlFor="can_login" className="text-sm text-neutral-700 dark:text-neutral-300">
            <Trans>Can login to system</Trans>
          </label>
        </div>

        {/* Is Active */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            className="w-4 h-4"
          />
          <label htmlFor="is_active" className="text-sm text-neutral-700 dark:text-neutral-300">
            <Trans>Active</Trans>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Trans>Updating...</Trans> : <Trans>Update User</Trans>}
          </Button>
          <Link href={`/dashboard/organization/companies/${companyId}/users`}>
            <Button type="button" variant="outline">
              <Trans>Cancel</Trans>
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
