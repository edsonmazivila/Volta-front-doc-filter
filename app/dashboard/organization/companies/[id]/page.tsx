import { Header } from "@/components/dashboard/header";
import { requireUser } from "@/lib/auth/dal";
import { getLocaleAndInitialize } from "@/lib/i18n/server";
import { redirect } from "next/navigation";
import { getCompanyById, getCompanyStats } from "@/lib/services/companies";
import { Card, CardHeader } from "@/components/dashboard/card";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Button } from "@/components/ui";
import Link from "next/link";
import { Trans } from "@lingui/react/macro";
import { t } from "@lingui/core/macro";
import { CompanyActions } from "@/components/organization/company-actions";

export default async function CompanyDetailsPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  await getLocaleAndInitialize();
  const user = await requireUser();
  
  const { id } = await params;
  const search = await searchParams;

  // Only organization_admin can view all companies
  if (user.role !== 'organization_admin' && user.role !== 'platform_owner') {
    redirect('/dashboard');
  }

  const [company, stats] = await Promise.all([
    getCompanyById(id).catch(() => null),
    getCompanyStats(id).catch(() => ({
      employees_count: 0,
      active_employees: 0,
      departments_count: 0,
      pending_timesheets: 0,
      active_leave_requests: 0
    }))
  ]);

  if (!company) {
    redirect('/dashboard/organization');
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <Header title={t`Company Details`} />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Success Message */}
        {search.success === 'updated' && (
          <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-3">
            <svg className="w-5 h-5 text-green-600 dark:text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-green-700 dark:text-green-400">
              <Trans>Company updated successfully!</Trans>
            </p>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/dashboard/organization">
                <Button variant="outline" size="sm">
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <Trans>Back</Trans>
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                {company.name}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  company.is_active
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-500'
                    : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-500'
                }`}
              >
                {company.is_active ? <Trans>Active</Trans> : <Trans>Inactive</Trans>}
              </span>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400">
              <Trans>Company details and statistics</Trans>
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            label={t`Total Employees`}
            value={stats.employees_count}
          />
          <StatsCard
            label={t`Active Employees`}
            value={stats.active_employees}
          />
          <StatsCard
            label={t`Departments`}
            value={stats.departments_count}
          />
          <StatsCard
            label={t`Pending Timesheets`}
            value={stats.pending_timesheets}
          />
        </div>

        {/* Company Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader title={t`Company Information`} />
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                    <Trans>Company Name</Trans>
                  </p>
                  <p className="font-medium">{company.name}</p>
                </div>
                {company.legal_name && (
                  <div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                      <Trans>Legal Name</Trans>
                    </p>
                    <p className="font-medium">{company.legal_name}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                    <Trans>Business Email</Trans>
                  </p>
                  <p className="font-medium">{company.business_email}</p>
                </div>
                {company.phone && (
                  <div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                      <Trans>Phone</Trans>
                    </p>
                    <p className="font-medium">{company.phone}</p>
                  </div>
                )}
              </div>

              {company.tax_id && (
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                    <Trans>Tax ID</Trans>
                  </p>
                  <p className="font-medium">{company.tax_id}</p>
                </div>
              )}

              {company.website && (
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                    <Trans>Website</Trans>
                  </p>
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline"
                  >
                    {company.website}
                  </a>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title={t`Address`} />
            <div className="p-6 space-y-2">
              {company.address_line1 ? (
                <>
                  <p>{company.address_line1}</p>
                  {company.city && company.state && (
                    <p>{company.city}, {company.state} {company.postal_code}</p>
                  )}
                  <p>{company.country}</p>
                </>
              ) : (
                <p className="text-neutral-500 dark:text-neutral-400">
                  <Trans>No address information</Trans>
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <CompanyActions company={company} />
      </main>
    </div>
  );
}
