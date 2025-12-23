import { Header } from "@/components/dashboard/header";
import { EmployeeTable } from "@/components/employees/employee-table";
import { getUsers, getAllOrganizationUsers } from "@/lib/services/users";
import { getAllCompanies } from "@/lib/services/companies";
import { requireRole } from "@/lib/rbac/server";
import { requireUser } from "@/lib/auth/dal";
import { t } from "@lingui/core/macro";
import { getLocaleAndInitialize } from "@/lib/i18n/server";

export default async function EmployeesPage() {
  await getLocaleAndInitialize();
  const user = await requireUser();
  await requireRole([
    "hr_manager",
    "system_admin",
    "organization_admin",
  ]);
  
  // Organization admin sees all users across all companies
  const isOrgAdmin = user.role === 'organization_admin';
  const [usersData, companiesData] = await Promise.all([
    isOrgAdmin ? getAllOrganizationUsers() : getUsers(),
    isOrgAdmin ? getAllCompanies().catch(() => ({ data: [] })) : Promise.resolve({ data: [] })
  ]);
  
  const users = usersData;
  const companies = companiesData.data || [];
  
  // Debug: Check what data we're getting
  console.log('[EmployeesPage] Sample user data:', users[0]);
  console.log('[EmployeesPage] Companies:', companies.map(c => ({ id: c.id, name: c.name })));
  
  // Create a map of company_id -> company_name for fast lookup
  const companyMap = new Map(companies.map(c => [c.id, c.name]));
  
  // Enrich users with company_name or organization_name
  const enrichedUsers = users.map(u => {
    const companyName = u.company_id ? companyMap.get(u.company_id) : undefined;
    
    return {
      ...u,
      company_name: companyName,
      organization_name: u.organization_name || 'Organization'
    };
  });
  
  const total = enrichedUsers.length;

  return (
    <>
      <Header title={t`Employee Management`} />
      <section className="p-4 overflow-y-auto">
        <div>
          <h1 className="text-xl font-bold">
            {t`Create, edit and manage your workforce.`}
          </h1>
        </div>
        <EmployeeTable initialEmployees={enrichedUsers} initialTotal={total} />
      </section>
    </>
  );
}
