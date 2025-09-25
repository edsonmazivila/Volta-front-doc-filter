import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { Card, CardHeader } from "@/components/dashboard/card";
import Link from "next/link";
import { EmployeeTable } from "@/components/employees/employee-table";

export default async function EmployeesPage() {
  return (
    <div className="min-h-dvh flex app-background">
      <Sidebar />
      <main className="flex-1">
        <Header title="Employee Management" />
        <section className="p-4">
          <Card>
            <CardHeader title="Create, edit and manage your workforce." />
            <div className="flex justify-end">
              <Link
                href="/employees/new"
                className="rounded-md bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-3 font-medium text-center"
              >
                Add Employee
              </Link>
            </div>
          </Card>
          <EmployeeTable />
        </section>
      </main>
    </div>
  );
}
