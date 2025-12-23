import { Header } from "@/components/dashboard/header";
import { requireUser } from "@/lib/auth/dal";
import { getLocaleAndInitialize } from "@/lib/i18n/server";
import { redirect } from "next/navigation";
import { getCompanyById } from "@/lib/services/companies";
import { getUsersByCompany } from "@/lib/services/users";
import { Card, CardHeader } from "@/components/dashboard/card";
import { Button } from "@/components/ui";
import Link from "next/link";
import { Trans } from "@lingui/react/macro";
import { t } from "@lingui/core/macro";
import { CompanyUsersTable } from "@/components/organization/company-users-table";

export default async function CompanyUsersPage({ 
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

  // Only organization_admin can manage users across companies
  if (user.role !== 'organization_admin' && user.role !== 'platform_owner') {
    redirect('/dashboard');
  }

  const [company, users] = await Promise.all([
    getCompanyById(id).catch(() => null),
    getUsersByCompany({ company_id: id }).catch(() => ({ data: [], count: 0 }))
  ]);

  if (!company) {
    redirect('/dashboard/organization');
  }

  // Debug: Log what we received from backend
  console.log(`[CompanyUsers] Requested company_id: ${id}`);
  console.log(`[CompanyUsers] Users received from backend:`, users.data.length);
  console.log(`[CompanyUsers] User company_ids:`, users.data.map(u => ({ name: u.full_name, company_id: u.company_id })));

  // Filter users to only show those belonging to this specific company
  // This is a safety check in case backend returns users from other companies
  const companyUsers = users.data.filter(u => u.company_id === id);
  
  console.log(`[CompanyUsers] After filtering: ${companyUsers.length} users`);

  const systemAdmins = companyUsers.filter(u => u.role === 'system_admin');
  const allOtherUsers = companyUsers.filter(u => u.role !== 'system_admin');

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <Header title={t`Manage Users - ${company.name}`} />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Success Message */}
        {search.success === 'created' && (
          <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-3">
            <svg className="w-5 h-5 text-green-600 dark:text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-green-700 dark:text-green-400">
              <Trans>User created successfully!</Trans>
            </p>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href={`/dashboard/organization/companies/${id}`}>
                <Button variant="outline" size="sm">
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <Trans>Back to Company</Trans>
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                <Trans>Users - {company.name}</Trans>
              </h1>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400">
              <Trans>Manage users and administrators for this company</Trans>
            </p>
          </div>
          <Link href={`/dashboard/organization/companies/${id}/users/new`}>
            <Button>
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <Trans>Add User</Trans>
            </Button>
          </Link>
        </div>

        {/* System Administrators Section */}
        <Card className="mb-8">
          <CardHeader title={`System Administrators (${systemAdmins.length})`} />
          <div className="p-6">
            {systemAdmins.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-amber-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-neutral-600 dark:text-neutral-400 mb-2 font-medium">
                  <Trans>No System Administrator assigned</Trans>
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-500 mb-4">
                  <Trans>Every company should have at least one System Administrator to manage operations</Trans>
                </p>
                <Link href={`/dashboard/organization/companies/${id}/users/new?role=system_admin`}>
                  <Button>
                    <Trans>Create System Admin</Trans>
                  </Button>
                </Link>
              </div>
            ) : (
              <CompanyUsersTable users={systemAdmins} companyId={id} />
            )}
          </div>
        </Card>

        {/* All Users Section */}
        <Card>
          <CardHeader title={`All Users (${allOtherUsers.length})`} />
          <div className="p-6">
            {allOtherUsers.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-neutral-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  <Trans>No users yet</Trans>
                </p>
                <Link href={`/dashboard/organization/companies/${id}/users/new`}>
                  <Button>
                    <Trans>Create First User</Trans>
                  </Button>
                </Link>
              </div>
            ) : (
              <CompanyUsersTable users={allOtherUsers} companyId={id} />
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}
