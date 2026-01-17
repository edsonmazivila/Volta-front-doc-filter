import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/dashboard/header";
import { requireRole } from "@/lib/rbac/server";
import {
  getDepartmentById,
  getDepartments,
  type DepartmentDetail,
} from "@/lib/services/departments";
import { getUsers } from "@/lib/services/users";
import { t } from "@lingui/core/macro";
import { getLocaleAndInitialize } from "@/lib/i18n/server";
import {
  Building2,
  Users,
  ChevronRight,
  ArrowLeft,
  GitBranch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DepartmentDetailClient } from "@/components/departments/department-detail-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DepartmentDetailPage({ params }: PageProps) {
  await getLocaleAndInitialize();
  await requireRole(["hr_manager", "system_admin", "organization_admin"]);

  const { id } = await params;
  const [department, allDepartments, allUsers] = await Promise.all([
    getDepartmentById(id),
    getDepartments(),
    getUsers(),
  ]);

  if (!department) {
    notFound();
  }

  // Get potential managers (users with manager/admin roles)
  // Always include the current manager even if their role changed, to prevent
  // the select from defaulting to "No manager" and accidentally clearing the assignment
  const managerRoles = [
    "system_admin",
    "hr_manager",
    "payroll_manager",
    "operational_manager",
  ];
  const managers = allUsers
    .filter(
      (u) =>
        managerRoles.includes(u.role) ||
        (department.manager_id && u.id === department.manager_id),
    )
    .map((u) => ({
      id: u.id,
      full_name: u.full_name,
    }));

  // Build breadcrumb path
  const breadcrumbs = buildBreadcrumbs(department, allDepartments);

  return (
    <>
      <Header title={department.name} />
      <section className="p-4 overflow-y-auto">
        {/* Back button and breadcrumbs */}
        <div className="mb-6">
          <Link href="/dashboard/departments">
            <Button variant="ghost" size="sm" className="mb-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t`Back to Departments`}
            </Button>
          </Link>

          {/* Breadcrumb navigation */}
          {breadcrumbs.length > 0 && (
            <nav className="flex items-center text-sm text-muted-foreground">
              <Link
                href="/dashboard/departments"
                className="hover:text-foreground"
              >
                {t`Departments`}
              </Link>
              {breadcrumbs.map((crumb, index) => (
                <span key={crumb.id} className="flex items-center">
                  <ChevronRight className="h-4 w-4 mx-1" />
                  {index === breadcrumbs.length - 1 ? (
                    <span className="font-medium text-foreground">
                      {crumb.name}
                    </span>
                  ) : (
                    <Link
                      href={`/dashboard/departments/${crumb.id}`}
                      className="hover:text-foreground"
                    >
                      {crumb.name}
                    </Link>
                  )}
                </span>
              ))}
            </nav>
          )}
        </div>

        {/* Department header */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {department.name}
                </h1>
                {department.parent_department_name && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <GitBranch className="h-3 w-3" />
                    {t`Part of`}{" "}
                    {department.parent_department_id ? (
                      <Link
                        href={`/dashboard/departments/${department.parent_department_id}`}
                        className="text-primary hover:underline"
                      >
                        {department.parent_department_name}
                      </Link>
                    ) : (
                      <span>{department.parent_department_name}</span>
                    )}
                  </p>
                )}
                {department.description && (
                  <p className="text-muted-foreground mt-2">
                    {department.description}
                  </p>
                )}
              </div>
            </div>
            <span
              className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                department.is_active
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
              }`}
            >
              {department.is_active ? t`Active` : t`Inactive`}
            </span>
          </div>

          {/* Manager info */}
          {department.manager && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{t`Manager:`}</span>
                <span className="font-medium">
                  {department.manager.full_name}
                </span>
                <span className="text-muted-foreground">
                  ({department.manager.email})
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Client component for interactive features */}
        <DepartmentDetailClient
          department={department}
          allDepartments={allDepartments}
          managers={managers}
        />
      </section>
    </>
  );
}

// Helper to build breadcrumb path from root to current department
function buildBreadcrumbs(
  department: DepartmentDetail,
  allDepartments: {
    id: string;
    name: string;
    parent_department_id: string | null;
  }[],
): { id: string; name: string }[] {
  const breadcrumbs: { id: string; name: string }[] = [];
  const visited = new Set<string>();
  let current:
    | { id: string; name: string; parent_department_id: string | null }
    | undefined = department;

  while (current) {
    // Guard against cyclic parent relationships
    if (visited.has(current.id)) {
      break;
    }
    visited.add(current.id);

    breadcrumbs.unshift({ id: current.id, name: current.name });
    if (current.parent_department_id) {
      // Check if parent is already visited before traversing
      if (visited.has(current.parent_department_id)) {
        break;
      }
      current = allDepartments.find(
        (d) => d.id === current!.parent_department_id,
      );
    } else {
      break;
    }
  }

  return breadcrumbs;
}
