"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  Building2,
  GitBranch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  deleteDepartmentAction,
  type Department,
  type DepartmentDetail,
} from "@/lib/services/departments";
import { DepartmentForm } from "./department-form";
import { useSession } from "@/components/auth/session-context";
import { hasAnyRole } from "@/lib/auth/utils";
import { useLingui } from "@lingui/react";
import { msg } from "@lingui/core/macro";

interface DepartmentDetailClientProps {
  department: DepartmentDetail;
  allDepartments: Department[];
  managers: Array<{ id: string; full_name: string }>;
}

export function DepartmentDetailClient({
  department,
  allDepartments,
  managers,
}: DepartmentDetailClientProps) {
  const router = useRouter();
  const { user } = useSession();
  const { i18n } = useLingui();
  const { showToast } = useToast();

  const [editOpen, setEditOpen] = useState(false);
  const [createChildOpen, setCreateChildOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const canManage = hasAnyRole(user, [
    "system_admin",
    "hr_manager",
    "organization_admin",
  ]);
  const childDepartments = department.child_departments || [];

  const handleDelete = async () => {
    try {
      await deleteDepartmentAction(department.id);
      showToast({
        type: "success",
        message: i18n._(msg`Department deleted successfully`),
        title: i18n._(msg`Success`),
      });
      router.push("/dashboard/departments");
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
    <>
      {/* Action buttons */}
      {canManage && (
        <div className="flex gap-2 mb-6">
          <Button onClick={() => setEditOpen(true)} variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            {i18n._(msg`Edit Department`)}
          </Button>
          <Button onClick={() => setCreateChildOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {i18n._(msg`Add Sub-Department`)}
          </Button>
          <Button
            onClick={() => setDeleteOpen(true)}
            variant="destructive"
            className="ml-auto"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {i18n._(msg`Delete`)}
          </Button>
        </div>
      )}

      {/* Child departments section */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-muted-foreground" />
            {i18n._(msg`Sub-Departments`)}
            <span className="text-sm font-normal text-muted-foreground">
              ({childDepartments.length})
            </span>
          </h2>
        </div>

        {childDepartments.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-border rounded-lg">
            <Building2 className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">
              {i18n._(msg`No sub-departments yet`)}
            </p>
            {canManage && (
              <Button
                onClick={() => setCreateChildOpen(true)}
                variant="outline"
                size="sm"
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                {i18n._(msg`Create Sub-Department`)}
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {childDepartments.map((child) => (
              <Link
                key={child.id}
                href={`/dashboard/departments/${child.id}`}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium group-hover:text-primary transition-colors">
                      {child.name}
                    </div>
                    {child.description && (
                      <div className="text-sm text-muted-foreground truncate max-w-md">
                        {child.description}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      child.is_active
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    {child.is_active
                      ? i18n._(msg`Active`)
                      : i18n._(msg`Inactive`)}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{i18n._(msg`Edit Department`)}</DialogTitle>
          </DialogHeader>
          <DepartmentForm
            department={department}
            onCancel={() => setEditOpen(false)}
            onSuccess={() => {
              setEditOpen(false);
              router.refresh();
            }}
            managers={managers}
            departments={allDepartments}
          />
        </DialogContent>
      </Dialog>

      {/* Create Child Dialog */}
      <Dialog open={createChildOpen} onOpenChange={setCreateChildOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {i18n._(msg`Create Sub-Department under ${department.name}`)}
            </DialogTitle>
          </DialogHeader>
          <DepartmentForm
            onCancel={() => setCreateChildOpen(false)}
            onSuccess={() => {
              setCreateChildOpen(false);
              router.refresh();
            }}
            managers={managers}
            departments={allDepartments}
            defaultParentId={department.id}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{i18n._(msg`Are you sure?`)}</AlertDialogTitle>
            <AlertDialogDescription>
              {childDepartments.length > 0
                ? i18n._(
                    msg`This department has ${childDepartments.length} sub-department(s). Deleting it will orphan these sub-departments. Are you sure you want to continue?`,
                  )
                : i18n._(
                    msg`This will permanently delete the department "${department.name}". This action cannot be undone.`,
                  )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{i18n._(msg`Cancel`)}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {i18n._(msg`Delete`)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
