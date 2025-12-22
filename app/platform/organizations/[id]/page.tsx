import { Header } from "@/components/dashboard/header";
import { requireUser } from "@/lib/auth/dal";
import { getLocaleAndInitialize } from "@/lib/i18n/server";
import { redirect, notFound } from "next/navigation";
import { getOrganizationById, getOrganizationStats } from "@/lib/services/organizations";
import { getCompaniesByOrganization } from "@/lib/services/companies";
import { Card, CardHeader } from "@/components/dashboard/card";
import { Trans } from "@lingui/react/macro";
import { t } from "@lingui/core/macro";
import { StatsCard } from "@/components/dashboard/stats-card";
import Link from "next/link";
import { OrganizationActions } from "@/components/platform/organization-actions";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function OrganizationDetailsPage({ params }: PageProps) {
  await getLocaleAndInitialize();
  const user = await requireUser();
  const { id } = await params;

  // Only platform_owner can access
  if (user.role !== 'platform_owner') {
    redirect('/dashboard');
  }

  const [orgResult, statsResult, companiesResult] = await Promise.all([
    getOrganizationById(id).catch((err) => {
      console.error('[PlatformOrg] Failed to fetch organization:', err.message);
      return null;
    }),
    getOrganizationStats(id).catch((err) => {
      console.error('[PlatformOrg] Failed to fetch stats:', err.message);
      return {
        companies_count: 0,
        employees_count: 0,
        active_employees: 0,
        departments_count: 0,
        total_payroll_mtd: 0
      };
    }),
    getCompaniesByOrganization(id).catch((err) => {
      console.error('[PlatformOrg] Failed to fetch companies:', err.message);
      return { data: [], count: 0, page: 1, limit: 50 };
    })
  ]);

  if (!orgResult) {
    notFound();
  }

  const organization = orgResult;
  const stats = statsResult;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
            <Trans>Approved</Trans>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
            <Trans>Pending Approval</Trans>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
            <Trans>Rejected</Trans>
          </span>
        );
      default:
        return null;
    }
  };

  const getTierBadge = (tier: string) => {
    const colors = {
      enterprise: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      professional: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      starter: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    };
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colors[tier as keyof typeof colors] || colors.starter}`}>
        {tier.charAt(0).toUpperCase() + tier.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <Header title={t`Organization Details`} />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Back Button */}
        <Link
          href="/platform/dashboard"
          className="inline-flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <Trans>Back to Platform Dashboard</Trans>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
                {organization.name}
              </h1>
              <div className="flex items-center gap-3">
                {getStatusBadge(organization.approval_status)}
                {getTierBadge(organization.tier)}
                {!organization.is_active && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300">
                    <Trans>Inactive</Trans>
                  </span>
                )}
              </div>
            </div>
            <OrganizationActions organization={organization} />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            label={t`Total Companies`}
            value={stats.companies_count}
          />
          <StatsCard
            label={t`Departments`}
            value={stats.departments_count}
          />
          <StatsCard
            label={t`Total Employees`}
            value={stats.employees_count}
          />
          <StatsCard
            label={t`Active Employees`}
            value={stats.active_employees}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Organization Information */}
          <Card>
            <CardHeader title={t`Organization Information`} />
            <div className="p-6 space-y-4">
              <div>
                <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  <Trans>Organization Name</Trans>
                </span>
                <p className="text-base text-neutral-900 dark:text-white mt-1">
                  {organization.name}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  <Trans>Tier</Trans>
                </span>
                <p className="text-base text-neutral-900 dark:text-white mt-1 capitalize">
                  {organization.tier}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  <Trans>Created</Trans>
                </span>
                <p className="text-base text-neutral-900 dark:text-white mt-1">
                  {new Date(organization.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </Card>

          {/* Additional Details */}
          <Card>
            <CardHeader title={t`Additional Details`} />
            <div className="p-6 space-y-4">
              <div>
                <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  <Trans>Organization ID</Trans>
                </span>
                <p className="text-base text-neutral-900 dark:text-white mt-1 font-mono text-sm">
                  {organization.id}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  <Trans>Active Status</Trans>
                </span>
                <p className="text-base text-neutral-900 dark:text-white mt-1">
                  {organization.is_active ? (
                    <span className="text-green-600 dark:text-green-400">
                      <Trans>Active</Trans>
                    </span>
                  ) : (
                    <span className="text-red-600 dark:text-red-400">
                      <Trans>Inactive</Trans>
                    </span>
                  )}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  <Trans>Last Updated</Trans>
                </span>
                <p className="text-base text-neutral-900 dark:text-white mt-1">
                  {new Date(organization.updated_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Companies List */}
        <Card className="mt-6">
          <CardHeader title={t`Companies (${companiesResult.count})`} />
          <div className="p-6">
            {companiesResult.count === 0 ? (
              <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
                <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <p className="text-lg font-medium">
                  <Trans>No companies yet</Trans>
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {companiesResult.data.map((company) => (
                  <div
                    key={company.id}
                    className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                  >
                    <h3 className="font-medium text-neutral-900 dark:text-white mb-2">
                      {company.name}
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                      {company.business_email}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        company.is_active
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300'
                      }`}>
                        {company.is_active ? <Trans>Active</Trans> : <Trans>Inactive</Trans>}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}
