import { Header } from "@/components/dashboard/header";
import { EmployeeTable } from "@/components/employees/employee-table";
import { getUsers, getAllOrganizationUsers } from "@/lib/services/users";
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
  const users = user.role === 'organization_admin' 
    ? await getAllOrganizationUsers()
    : await getUsers();
  
  const employees = users;
  const total = employees.length;

  return (
    <>
      <Header title={t`Employee Management`} />
      <section className="p-4 overflow-y-auto">
        <div>
          <h1 className="text-xl font-bold">
            {t`Create, edit and manage your workforce.`}
          </h1>
        </div>
        <EmployeeTable initialEmployees={employees} initialTotal={total} />
      </section>
    </>
  );
}
