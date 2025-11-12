import { Header } from "@/components/dashboard/header";
import { EmployeeTable } from "@/components/employees/employee-table";
import { getUsers } from "@/lib/services/users";
import { requireRole } from "@/lib/rbac/server";

export default async function EmployeesPage() {
  await requireRole([
    "hr_manager",
    "system_admin",
  ]);
  const users = await getUsers();
  const employees = users;
  const total = employees.length;

  return (
    <>
      <Header title="Employee Management" />
      <section className="p-4 overflow-y-auto">
        <div>
          <h1 className="text-xl font-bold">
            Create, edit and manage your workforce.
          </h1>
        </div>
        <EmployeeTable initialEmployees={employees} initialTotal={total} />
      </section>
    </>
  );
}
