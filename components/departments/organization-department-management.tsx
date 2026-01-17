"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/dashboard/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Plus,
  Users,
  UserCheck,
  ChevronRight,
  GitBranch,
} from "lucide-react";
import { OrganizationDepartmentFormDialog } from "./organization-department-form-dialog";
import type { OrganizationDepartment } from "@/lib/services/organization-data";
import type { Company } from "@/lib/types/organization";

interface OrganizationDepartmentManagementProps {
  departments: OrganizationDepartment[];
  companies: Company[];
  initialCompanyFilter?: string;
}

export function OrganizationDepartmentManagement({
  departments,
  companies,
  initialCompanyFilter,
}: OrganizationDepartmentManagementProps) {
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [companyFilter, setCompanyFilter] = useState(
    initialCompanyFilter || "all",
  );

  const filteredDepartments =
    companyFilter === "all"
      ? departments
      : departments.filter((d) => d.company_id === companyFilter);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setCompanyFilter(value);
    // Update URL with new filter
    const url = new URL(window.location.href);
    if (value === "all") {
      url.searchParams.delete("company");
    } else {
      url.searchParams.set("company", value);
    }
    window.history.pushState({}, "", url.toString());
  };

  return (
    <>
      {/* Filters and Actions */}
      <Card>
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 max-w-xs">
            <label className="text-sm font-medium mb-2 block">
              Filter by Company
            </label>
            <select
              className="w-full px-3 py-2 border rounded-lg bg-background"
              value={companyFilter}
              onChange={handleFilterChange}
            >
              <option value="all">All Companies ({departments.length})</option>
              {companies.map((company) => {
                const count = departments.filter(
                  (d) => d.company_id === company.id,
                ).length;
                return (
                  <option key={company.id} value={company.id}>
                    {company.name} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Department
          </Button>
        </div>
      </Card>

      {/* Departments Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Company
                </div>
              </TableHead>
              <TableHead>Department Name</TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  <GitBranch className="h-4 w-4" />
                  Parent
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  Manager
                </div>
              </TableHead>
              <TableHead className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Users className="h-4 w-4" />
                  Employees
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDepartments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground py-8"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Building2 className="h-12 w-12 text-muted-foreground/50" />
                    <p>No departments available</p>
                    <p className="text-sm">
                      Get started by creating a new department.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredDepartments.map((department) => (
                <TableRow
                  key={department.id}
                  className="cursor-pointer hover:bg-muted/50 group"
                  onClick={() =>
                    router.push(`/dashboard/departments/${department.id}`)
                  }
                >
                  <TableCell className="font-medium">
                    {department.company_name}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="group-hover:text-primary transition-colors">
                        {department.name}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </TableCell>
                  <TableCell>
                    {department.parent_department_name ? (
                      <span className="text-muted-foreground text-sm">
                        {department.parent_department_name}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/60 text-xs italic">
                        Top-level
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {department.manager_name ? (
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <UserCheck className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium">
                          {department.manager_name}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <Users className="h-4 w-4" />
                        </div>
                        <span className="text-sm italic">
                          No manager assigned
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary">
                      {department.employees_count}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        department.is_active ? "bg-green-500" : "bg-gray-500"
                      }
                    >
                      {department.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Create Department Dialog */}
      <OrganizationDepartmentFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        companies={companies}
      />
    </>
  );
}
