"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit,
  Trash2,
  Building2,
  MoreHorizontal,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  deleteDepartmentAction,
  type Department,
  type DepartmentStats,
} from "@/lib/services/departments";
import { DepartmentForm } from "./department-form";
import { useSession } from "@/components/auth/session-context";
import { hasAnyRole } from "@/lib/auth/utils";
import { useLingui } from "@lingui/react";
import { msg } from "@lingui/core/macro";

interface DepartmentManagementProps {
  departments: Department[];
  stats: DepartmentStats;
  managers: Array<{ id: string; full_name: string }>;
}

export function DepartmentManagement({
  departments,
  stats,
  managers,
}: DepartmentManagementProps) {
  const router = useRouter();
  const { user } = useSession();
  const { i18n } = useLingui();
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);
  const [departmentToDelete, setDepartmentToDelete] =
    useState<Department | null>(null);
  const { showToast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Stable handlers to avoid triggering controlled <Dialog> state loops
  const handleCreateOpenChange = React.useCallback((open: boolean) => {
    setCreateOpen(open);
    if (!open) {
      // ensure any transient state related to create is cleared
    }
  }, []);

  const handleEditOpenChange = React.useCallback((open: boolean) => {
    setEditOpen(open);
    if (!open) {
      setSelectedDepartment(null);
    }
  }, []);

  const handleDeleteOpenChange = React.useCallback((open: boolean) => {
    setDeleteOpen(open);
    if (!open) {
      setDepartmentToDelete(null);
    }
  }, []);

  const canManage = hasAnyRole(user, [
    "system_admin",
    "hr_manager",
    "organization_admin",
  ]);

  const handleDelete = async () => {
    if (!departmentToDelete) return;

    try {
      await deleteDepartmentAction(departmentToDelete.id);
      showToast({
        type: "success",
        message: i18n._(msg`Department deleted successfully`),
        title: i18n._(msg`Success`),
      });
      setDeleteOpen(false);
      setDepartmentToDelete(null);
    } catch (error: unknown) {
      showToast({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : i18n._(msg`Failed to delete department`),
        title: i18n._(msg`Error`),
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-card border border-border">
          <div className="text-sm text-muted-foreground">
            {i18n._(msg`Total Departments`)}
          </div>
          <div className="text-2xl font-bold text-foreground">
            {stats.totalDepartments}
          </div>
        </div>
        <div className="p-4 rounded-lg bg-card border border-border">
          <div className="text-sm text-muted-foreground">
            {i18n._(msg`Active`)}
          </div>
          <div className="text-2xl font-bold text-green-600">
            {stats.activeDepartments}
          </div>
        </div>
        <div className="p-4 rounded-lg bg-card border border-border">
          <div className="text-sm text-muted-foreground">
            {i18n._(msg`Inactive`)}
          </div>
          <div className="text-2xl font-bold text-red-600">
            {stats.inactiveDepartments}
          </div>
        </div>
        <div className="p-4 rounded-lg bg-card border border-border">
          <div className="text-sm text-muted-foreground">
            {i18n._(msg`With Manager`)}
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {stats.departmentsWithManager}
          </div>
        </div>
      </div>

      {/* Departments Table Section */}
      <div className="space-y-4">
        {/* Action Bar */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-foreground">
            {i18n._(msg`Departments List`)}
          </h3>
          {canManage && (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {i18n._(msg`Add Department`)}
            </Button>
          )}
        </div>

        {/* Table */}
        {departments.length === 0 ? (
          <div className="text-center py-12 border border-border rounded-lg bg-card ">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium text-foreground">
              {i18n._(msg`No departments`)}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {i18n._(msg`Get started by creating a new department.`)}
            </p>
            {canManage && (
              <div className="mt-6">
                <Button onClick={() => setCreateOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  {i18n._(msg`Add Department`)}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto border-t border-[var(--border)]">
            <table className="w-full text-sm min-w-[900px]">
              <thead className="border-b border-[var(--border)] text-neutral-400 sticky top-0 bg-background z-10 shadow-sm">
                <tr>
                  <th className="text-left p-3 min-w-[200px]">
                    {i18n._(msg`Name`)}
                  </th>
                  <th className="text-left p-3 min-w-[150px]">
                    {i18n._(msg`Parent`)}
                  </th>
                  <th className="text-left p-3 min-w-[200px]">
                    {i18n._(msg`Description`)}
                  </th>
                  <th className="text-left p-3 min-w-[150px]">
                    {i18n._(msg`Manager`)}
                  </th>
                  <th className="text-left p-3 min-w-[100px]">
                    {i18n._(msg`Status`)}
                  </th>
                  {canManage && (
                    <th className="text-left p-3 min-w-[100px]">
                      {i18n._(msg`Actions`)}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {departments.map((department) => (
                  <tr
                    key={department.id}
                    className="border-b border-[var(--border)] hover:bg-muted/50 cursor-pointer group"
                    onClick={() =>
                      router.push(`/dashboard/departments/${department.id}`)
                    }
                  >
                    <td className="p-3 min-w-[200px]">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium group-hover:text-primary transition-colors">
                          {department.name}
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </td>
                    <td className="p-3 min-w-[150px]">
                      {department.parent_department_name ? (
                        <span className="text-sm text-muted-foreground">
                          {department.parent_department_name}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground/60 italic">
                          {i18n._(msg`Top-level`)}
                        </span>
                      )}
                    </td>
                    <td className="p-3 min-w-[200px]">
                      <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {department.description || i18n._(msg`No description`)}
                      </div>
                    </td>
                    <td className="p-3 min-w-[150px]">
                      {department.manager ? (
                        <div className="text-sm font-medium">
                          {department.manager.full_name}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {i18n._(msg`No manager`)}
                        </span>
                      )}
                    </td>
                    <td className="p-3 min-w-[100px]">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          department.is_active
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {department.is_active
                          ? i18n._(msg`Active`)
                          : i18n._(msg`Inactive`)}
                      </span>
                    </td>
                    {canManage && (
                      <td className="p-3 min-w-[100px]">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDepartment(department);
                                setEditOpen(true);
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              {i18n._(msg`Edit`)}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setDepartmentToDelete(department);
                                setDeleteOpen(true);
                              }}
                              className="text-red-400 focus:text-red-400"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {i18n._(msg`Delete`)}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={handleCreateOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{i18n._(msg`Create Department`)}</DialogTitle>
          </DialogHeader>
          <DepartmentForm
            onCancel={() => handleCreateOpenChange(false)}
            onSuccess={() => handleCreateOpenChange(false)}
            managers={managers}
            departments={departments}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={handleEditOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{i18n._(msg`Edit Department`)}</DialogTitle>
          </DialogHeader>
          {selectedDepartment && (
            <DepartmentForm
              department={selectedDepartment}
              onCancel={() => handleEditOpenChange(false)}
              onSuccess={() => handleEditOpenChange(false)}
              managers={managers}
              departments={departments}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={handleDeleteOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{i18n._(msg`Are you sure?`)}</AlertDialogTitle>
            <AlertDialogDescription>
              {i18n._(
                msg`This will permanently delete the department "${departmentToDelete?.name ?? ""}". This action cannot be undone.`,
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => handleDeleteOpenChange(false)}>
              {i18n._(msg`Cancel`)}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {i18n._(msg`Delete`)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
