import { Header } from "@/components/dashboard/header";
import { EmployeeTable } from "@/components/employees/employee-table";
import { getEmployees } from "@/lib/services/employees";
import { requireRole } from "@/lib/rbac/server";

export default async function EmployeesPage() {
  await requireRole([
    "operational_manager",
    "hr_manager",
    "payroll_manager",
    "system_admin",
  ]);
  const { items: employees, total } = await getEmployees();

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
