"use client";

import React, { useState } from "react";
import { Plus, Edit, Trash2, Building2, MoreHorizontal } from "lucide-react";
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
  const { user } = useSession();
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

  const canManage = hasAnyRole(user, ["system_admin", "hr_manager"]);

  const handleDelete = async () => {
    if (!departmentToDelete) return;

    try {
      await deleteDepartmentAction(departmentToDelete.id);
      showToast({
        type: "success",
        message: "Department deleted successfully",
        title: "Success",
      });
      setDeleteOpen(false);
      setDepartmentToDelete(null);
    } catch (error: unknown) {
      showToast({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to delete department",
        title: "Error",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-card border border-border">
          <div className="text-sm text-muted-foreground">Total Departments</div>
          <div className="text-2xl font-bold text-foreground">
            {stats.totalDepartments}
          </div>
        </div>
        <div className="p-4 rounded-lg bg-card border border-border">
          <div className="text-sm text-muted-foreground">Active</div>
          <div className="text-2xl font-bold text-green-600">
            {stats.activeDepartments}
          </div>
        </div>
        <div className="p-4 rounded-lg bg-card border border-border">
          <div className="text-sm text-muted-foreground">Inactive</div>
          <div className="text-2xl font-bold text-red-600">
            {stats.inactiveDepartments}
          </div>
        </div>
        <div className="p-4 rounded-lg bg-card border border-border">
          <div className="text-sm text-muted-foreground">With Manager</div>
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
            Departments List
          </h3>
          {canManage && (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Department
            </Button>
          )}
        </div>

        {/* Table */}
        {departments.length === 0 ? (
          <div className="text-center py-12 border border-border rounded-lg bg-card ">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium text-foreground">
              No departments
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Get started by creating a new department.
            </p>
            {canManage && (
              <div className="mt-6">
                <Button onClick={() => setCreateOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Department
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto border-t border-[var(--border)]">
            <table className="w-full text-sm min-w-[800px]">
              <thead className="border-b border-[var(--border)] text-neutral-400 sticky top-0 bg-background z-10 shadow-sm">
                <tr>
                  <th className="text-left p-3 min-w-[200px]">Name</th>
                  <th className="text-left p-3 min-w-[250px]">Description</th>
                  <th className="text-left p-3 min-w-[200px]">Manager</th>
                  <th className="text-left p-3 min-w-[100px]">Status</th>
                  {canManage && (
                    <th className="text-left p-3 min-w-[100px]">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {departments.map((department) => (
                  <tr
                    key={department.id}
                    className="border-b border-[var(--border)] hover:bg-muted/50"
                  >
                    <td className="p-3 min-w-[200px]">
                      <div className="text-sm font-medium">
                        {department.name}
                      </div>
                    </td>
                    <td className="p-3 min-w-[250px]">
                      <div className="text-sm text-muted-foreground">
                        {department.description || "No description"}
                      </div>
                    </td>
                    <td className="p-3 min-w-[200px]">
                      {department.manager ? (
                        <div className="text-sm">
                          <div className="font-medium">
                            {department.manager.full_name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {department.manager.email}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          No manager
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
                        {department.is_active ? "Active" : "Inactive"}
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
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedDepartment(department);
                                setEditOpen(true);
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setDepartmentToDelete(department);
                                setDeleteOpen(true);
                              }}
                              className="text-red-400 focus:text-red-400"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
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
            <DialogTitle>Create Department</DialogTitle>
          </DialogHeader>
          <DepartmentForm
            onCancel={() => handleCreateOpenChange(false)}
            onSuccess={() => handleCreateOpenChange(false)}
            managers={managers}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={handleEditOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
          </DialogHeader>
          {selectedDepartment && (
            <DepartmentForm
              department={selectedDepartment}
              onCancel={() => handleEditOpenChange(false)}
              onSuccess={() => handleEditOpenChange(false)}
              managers={managers}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={handleDeleteOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the department &quot;
              {departmentToDelete?.name}&quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => handleDeleteOpenChange(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
