import { Header } from "@/components/dashboard/header";
import { requireUser } from "@/lib/auth/dal";
import { getLocaleAndInitialize } from "@/lib/i18n/server";
import { redirect } from "next/navigation";
import { getAllCompanies } from "@/lib/services/companies";
import { Organization, OrganizationStats } from "@/lib/types/organization";
import { Trans } from "@lingui/react/macro";
import { t } from "@lingui/core/macro";
import { SuccessMessage } from "@/components/organization/success-message";
import { OrganizationDashboardClient } from "@/components/organization/organization-dashboard-client";
import { CompanyProvider } from "@/components/organization/company-context";

export default async function OrganizationPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; name?: string }>;
}) {
  const user = await requireUser();
  await getLocaleAndInitialize();

  // Only organization_admin and platform_owner can access
  if (user.role !== 'organization_admin' && user.role !== 'platform_owner') {
    redirect('/dashboard');
  }

  // Fetch companies data with stats
  const companiesResponse = await getAllCompanies().catch((err) => {
    console.warn('[Organization Page] Failed to fetch companies:', err.message);
    return { data: [], count: 0 };
  });

  const companies = companiesResponse.data;

  // Build organization from user data (already available in session)
  const organization: Organization = {
    id: user.organization_id || 'unknown',
    name: 'Your Organization', // Will be displayed from company data
    is_active: true,
    tier: 'standard' as 'standard' | 'premium' | 'enterprise',
    approval_status: 'approved' as 'pending' | 'approved' | 'rejected',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Calculate stats from companies data
  const stats: OrganizationStats = {
    companies_count: companies.length,
    employees_count: companies.reduce((sum, c) => sum + (c.employees_count || 0), 0),
    active_employees: companies.reduce((sum, c) => sum + (c.active_employees || 0), 0),
    departments_count: companies.reduce((sum, c) => sum + (c.departments_count || 0), 0),
    total_payroll_mtd: 0, // Will be calculated from payroll data if available
    users_count: 0,
    active_users: 0,
    pending_approvals: 0
  };

  // Await searchParams at the very end
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <Header title={t`Organization`} />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Success Messages */}
        <SuccessMessage searchParams={params} />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            {organization?.name || <Trans>Organization Dashboard</Trans>}
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            <Trans>Manage your organization and companies</Trans>
          </p>
        </div>

        {/* Company Switcher and Dashboard Content */}
        <CompanyProvider>
          <OrganizationDashboardClient
            companies={companies}
            stats={stats}
          />
        </CompanyProvider>
      </main>
    </div>
  );
}
