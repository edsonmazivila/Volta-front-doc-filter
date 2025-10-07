import { Suspense } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { EmployeeTable } from "@/components/employees/employee-table";
import { getEmployees } from "@/lib/services/employees";
import { requireRole } from "@/lib/rbac/server";

export default async function EmployeesPage() {
  // Only managers and admins can access employee management
  await requireRole(['operational_manager', 'hr_manager', 'payroll_manager', 'system_admin']);
  const { items: employees, total } = await getEmployees();

  return (
    <div className="min-h-dvh flex app-background">
      <Sidebar />
      <main className="flex-1">
        <Header title="Employee Management" />
        <section className="p-4">
          <div>
            <h1 className="text-xl font-bold">
              Create, edit and manage your workforce.
            </h1>
          </div>
          <Suspense fallback={<EmployeeTableSkeleton />}>
            <EmployeeTable initialEmployees={employees} initialTotal={total} />
          </Suspense>
        </section>
      </main>
    </div>
  );
}

function EmployeeTableSkeleton() {
  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="p-3 flex items-center gap-2 border-b border-[var(--border)]">
        <div className="h-10 bg-neutral-700/50 rounded-md flex-1 animate-pulse" />
        <div className="h-10 w-32 bg-neutral-700/50 rounded-md animate-pulse" />
        <div className="h-10 w-32 bg-neutral-700/50 rounded-md animate-pulse" />
        <div className="h-10 w-32 bg-neutral-700/50 rounded-md animate-pulse" />
      </div>
      <div className="p-4">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-12 bg-neutral-700/50 rounded-md animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
