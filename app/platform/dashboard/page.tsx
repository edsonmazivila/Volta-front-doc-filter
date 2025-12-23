import { Header } from "@/components/dashboard/header";
import { requireUser } from "@/lib/auth/dal";
import { getLocaleAndInitialize } from "@/lib/i18n/server";
import { redirect } from "next/navigation";
import { getAllOrganizations, getPendingOrganizations } from "@/lib/services/organizations";
import { getPlatformStats } from "@/lib/services/platform";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardHeader } from "@/components/dashboard/card";
import { Trans } from "@lingui/react/macro";
import { t } from "@lingui/core/macro";
import { PendingOrganizationsTable } from "@/components/platform/pending-organizations-table";
import { AllOrganizationsTable } from "@/components/platform/all-organizations-table";

export default async function PlatformDashboardPage() {
  await getLocaleAndInitialize();
  const user = await requireUser();

  // Only platform_owner can access
  if (user.role !== 'platform_owner') {
    redirect('/dashboard');
  }

  const [allOrgs, pendingOrgs, platformStats] = await Promise.all([
    getAllOrganizations().catch((err) => {
      console.error('[Platform] Failed to fetch all organizations:', err.message);
      return { data: [], count: 0 };
    }),
    getPendingOrganizations().catch((err) => {
      console.error('[Platform] Failed to fetch pending organizations:', err.message);
      return { data: [], count: 0 };
    }),
    getPlatformStats().catch((err) => {
      console.error('[Platform] Failed to fetch platform stats:', err.message);
      return undefined;
    })
  ]);

  // Use backend stats if available, otherwise calculate from orgs data
  const stats = platformStats || {
    total: allOrgs.count,
    pending: pendingOrgs.count,
    approved: allOrgs.data.filter(o => o.approval_status === 'approved').length,
    rejected: allOrgs.data.filter(o => o.approval_status === 'rejected').length,
    active: allOrgs.data.filter(o => o.is_active).length,
    inactive: allOrgs.data.filter(o => !o.is_active).length,
    suspended: 0
  };

  const approvedCount = stats.approved;
  const rejectedCount = stats.rejected;
  const totalCompanies = allOrgs.data.reduce((sum, org) => sum + (org.companies_count || 0), 0);
  const totalUsers = allOrgs.data.reduce((sum, org) => sum + (org.users_count || 0), 0);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <Header title={t`Platform Dashboard`} />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            <Trans>Platform Dashboard</Trans>
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            <Trans>Manage all organizations and platform-wide settings</Trans>
          </p>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            label={t`Total Organizations`}
            value={stats.total}
          />
          <StatsCard
            label={t`Pending Approval`}
            value={stats.pending}
          />
          <StatsCard
            label={t`Approved`}
            value={stats.approved}
          />
          <StatsCard
            label={t`Active`}
            value={stats.active}
          />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            label={t`Total Companies`}
            value={totalCompanies}
          />
          <StatsCard
            label={t`Total Users`}
            value={totalUsers}
          />
          <StatsCard
            label={t`Rejected`}
            value={stats.rejected}
          />
        </div>

        {/* Pending Organizations - Priority */}
        {pendingOrgs.count > 0 && (
          <Card className="mb-8">
            <CardHeader title={t`Pending Organizations (${pendingOrgs.count})`} />
            <div className="px-6 pt-2 pb-4">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                <Trans>Organizations awaiting your approval</Trans>
              </p>
            </div>
            <div className="p-6">
              <PendingOrganizationsTable organizations={pendingOrgs.data} />
            </div>
          </Card>
        )}

        {/* All Organizations */}
        <Card>
          <CardHeader title={t`All Organizations`} />
          <div className="px-6 pt-2 pb-4">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              <Trans>Approved: {approvedCount} | Rejected: {rejectedCount} | Pending: {pendingOrgs.count}</Trans>
            </p>
          </div>
          <div className="p-6">
            <AllOrganizationsTable organizations={allOrgs.data} />
          </div>
        </Card>
      </main>
    </div>
  );
}
