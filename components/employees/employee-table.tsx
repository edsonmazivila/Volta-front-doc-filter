"use client";
import { useState, useMemo } from "react";
import {
  type User,
  deleteUserAction,
  toggleUserStatusAction,
} from "@/lib/services/users";
import { useLingui } from "@lingui/react";
import { msg } from "@lingui/core/macro";

type EmployeeListParams = {
  status?: 'active' | 'inactive' | 'all';
  login?: 'can_login' | 'cannot_login' | 'all';
  sort?: 'name' | 'status' | 'department';
};
import { Button } from "@/components/ui";
import { SearchInput } from "@/components/search-input";
import { DeleteEmployeeDialog } from "./delete-employee-dialog";
import { EmployeeViewDialog } from "./employee-view-dialog";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Eye, UserCheck, UserX } from "lucide-react";
import { ROLE_DISPLAY_NAMES } from "@/lib/rbac/types";

interface EmployeeTableProps {
  initialEmployees: User[];
  initialTotal: number;
}

export function EmployeeTable({ initialEmployees }: EmployeeTableProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const { i18n } = useLingui();

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<EmployeeListParams["status"]>("all");
  const [login, setLogin] = useState<EmployeeListParams["login"]>("all");
  const [department, setDepartment] = useState("");
  const [sort, setSort] = useState<EmployeeListParams["sort"]>("name");

  const [deletingEmployee, setDeletingEmployee] = useState<User | null>(
    null
  );
  const [viewingEmployee, setViewingEmployee] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [employeeToDeactivate, setEmployeeToDeactivate] = useState<User | null>(null);

  // Bulk actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkDelete, setShowBulkDelete] = useState(false);

  const handleRowClick = (employee: User, event: React.MouseEvent) => {
    // Don't open dialog if clicking on checkbox, buttons, or other interactive elements
    const target = event.target as HTMLElement;
    if (
      (target as HTMLInputElement).type === "checkbox" ||
      target.closest("button") ||
      target.closest("input") ||
      target.closest('[role="button"]')
    ) {
      return;
    }
    setViewingEmployee(employee);
  };

  const handleDelete = async (employee: User) => {
    setIsSubmitting(true);
    try {
      await deleteUserAction(employee.id);
      showToast({ type: "success", message: i18n._(msg`Employee deleted successfully`) });
      setDeletingEmployee(null);
      router.refresh();
    } catch {
      showToast({ type: "error", message: i18n._(msg`Failed to delete employee`) });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (employeeId: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      await toggleUserStatusAction(employeeId, newStatus);
      showToast({
        type: "success",
        message: newStatus ? i18n._(msg`Employee activated successfully`) : i18n._(msg`Employee deactivated successfully`),
      });
      router.refresh();
    } catch {
      showToast({ type: "error", message: i18n._(msg`Failed to update employee status`) });
    }
  };

  const handleDeactivateConfirm = async () => {
    if (!employeeToDeactivate) return;

    try {
      await toggleUserStatusAction(employeeToDeactivate.id, false);
      showToast({
        type: "success",
        message: i18n._(msg`Employee deactivated successfully`),
      });
      setDeactivateOpen(false);
      setEmployeeToDeactivate(null);
      router.refresh();
    } catch {
      showToast({ type: "error", message: i18n._(msg`Failed to deactivate employee`) });
    }
  };

  const handleBulkDelete = async () => {
    setIsSubmitting(true);
    try {
      // Use Promise.allSettled to handle partial failures gracefully
      const results = await Promise.allSettled(
        Array.from(selectedIds).map((id) => deleteUserAction(id))
      );

      const succeeded = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      // Clear selection and close dialog regardless of outcome
      setSelectedIds(new Set());
      setShowBulkDelete(false);
      router.refresh();

      // Provide detailed feedback based on results
      if (failed === 0) {
        showToast({
          type: "success",
          message: succeeded > 1
            ? i18n._(msg`Successfully deleted ${succeeded} employees`)
            : i18n._(msg`Successfully deleted 1 employee`),
        });
      } else if (succeeded === 0) {
        showToast({
          type: "error",
          message: i18n._(msg`Failed to delete all ${failed} employees. Please try again.`),
        });
      } else {
        showToast({
          type: "warning",
          message: succeeded > 1
            ? i18n._(msg`Deleted ${succeeded} employees, but ${failed} failed. Please review and retry.`)
            : i18n._(msg`Deleted 1 employee, but ${failed} failed. Please review and retry.`),
        });
      }
    } catch {
      showToast({ type: "error", message: i18n._(msg`An unexpected error occurred`) });
      setSelectedIds(new Set());
      setShowBulkDelete(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredAndSortedItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAndSortedItems.map((e) => e.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Client-side filtering and sorting
  const filteredAndSortedItems = useMemo(() => {
    let filtered = initialEmployees;

    // Filter by search query
    if (query) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter((e) =>
        `${e.full_name} ${e.email} ${e.department || ""} ${e.job_title || ""}`
          .toLowerCase()
          .includes(lowerQuery)
      );
    }

    // Filter by department
    if (department) {
      filtered = filtered.filter((e) => e.department === department);
    }

    // Filter by status
    if (status !== "all") {
      filtered = filtered.filter((e) =>
        status === "active" ? e.is_active : !e.is_active
      );
    }

    // Filter by login capability
    if (login !== "all") {
      filtered = filtered.filter((e) =>
        login === "can_login" ? e.can_login : !e.can_login
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      let compareValue = 0;

      switch (sort) {
        case "name":
          compareValue = (a.full_name || "").localeCompare(b.full_name || "");
          break;
        case "status":
          compareValue = a.is_active === b.is_active ? 0 : a.is_active ? -1 : 1;
          break;
        case "department":
          compareValue = (a.department || "").localeCompare(b.department || "");
          break;
      }

      return compareValue;
    });

    return sorted;
  }, [initialEmployees, query, department, status, login, sort]);

  // Get unique departments for filter
  const departments = useMemo(() => {
    const depts = new Set(
      initialEmployees.map((e) => e.department).filter(Boolean)
    );
    return Array.from(depts).sort();
  }, [initialEmployees]);

  return (
    <div className="glass rounded-xl overflow-hidden">
      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="p-2 bg-blue-500/10 border-b border-blue-500/20 flex sm:items-center flex-col sm:flex-row sm:justify-between">
          <span className="text-sm font-medium mb-3 sm:mb-0">
            {i18n._(msg`${selectedIds.size} selected`)}
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedIds(new Set())}
            >
              {i18n._(msg`Clear`)}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowBulkDelete(true)}
            >
              {i18n._(msg`Delete Selected`)}
            </Button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="p-2 flex gap-2 border-b border-[var(--border)] flex-wrap sm:flex-row">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder={i18n._(msg`Search employees`)}
        />
        <Select
          value={department || "all"}
          onValueChange={(v) => setDepartment(v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-full sm:w-[180px] bg-background border-[var(--border)]">
            <SelectValue placeholder={i18n._(msg`All Departments`)} />
          </SelectTrigger>
          <SelectContent className="bg-background border-[var(--border)]">
            <SelectItem value="all">{i18n._(msg`All Departments`)}</SelectItem>
            {departments.map((dept) => {
              const val = String(dept || "");
              return (
                <SelectItem key={val} value={val}>
                  {val}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        <Select
          value={status}
          onValueChange={(v) => setStatus(v as EmployeeListParams["status"])}
        >
          <SelectTrigger className="w-full sm:w-[180px] bg-background border-[var(--border)]">
            <SelectValue placeholder={i18n._(msg`Status`)} />
          </SelectTrigger>
          <SelectContent className="bg-background border-[var(--border)]">
            <SelectItem value="all">{i18n._(msg`All Status`)}</SelectItem>
            <SelectItem value="active">{i18n._(msg`Active`)}</SelectItem>
            <SelectItem value="inactive">{i18n._(msg`Inactive`)}</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={login}
          onValueChange={(v) => setLogin(v as EmployeeListParams["login"])}
        >
          <SelectTrigger className="w-full sm:w-[180px] bg-background border-[var(--border)]">
            <SelectValue placeholder={i18n._(msg`Login Access`)} />
          </SelectTrigger>
          <SelectContent className="bg-background border-[var(--border)]">
            <SelectItem value="all">{i18n._(msg`All Login Access`)}</SelectItem>
            <SelectItem value="can_login">{i18n._(msg`Can Login`)}</SelectItem>
            <SelectItem value="cannot_login">{i18n._(msg`Cannot Login`)}</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={sort}
          onValueChange={(v) => setSort(v as EmployeeListParams["sort"])}
        >
          <SelectTrigger className="w-full sm:w-[180px] bg-background border-[var(--border)]">
            <SelectValue placeholder={i18n._(msg`Sort by`)} />
          </SelectTrigger>
          <SelectContent className="bg-background border-[var(--border)]">
            <SelectItem value="name">{i18n._(msg`Name`)}</SelectItem>
            <SelectItem value="status">{i18n._(msg`Status`)}</SelectItem>
            <SelectItem value="department">{i18n._(msg`Department`)}</SelectItem>
          </SelectContent>
        </Select>
        <Button
          size="sm"
          onClick={() => router.push("/dashboard/employees/new")}
          className="w-full sm:w-auto sm:ml-auto"
        >
          {i18n._(msg`Add Employee`)}
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="border-b border-[var(--border)] text-neutral-400 sticky top-0 bg-background z-10 shadow-sm">
            <tr>
              <th className="w-12 p-3 min-w-[48px]">
                <input
                  type="checkbox"
                  checked={
                    selectedIds.size === filteredAndSortedItems.length &&
                    filteredAndSortedItems.length > 0
                  }
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-[var(--border)]"
                />
              </th>
              <th className="text-left p-3 min-w-[200px]">
                <div className="flex items-center gap-2">
                  {i18n._(msg`Name`)}
                  <span className="text-xs text-muted-foreground">
                    {i18n._(msg`(click to view details)`)}
                  </span>
                </div>
              </th>
              <th className="text-left p-3 min-w-[180px]">{i18n._(msg`Email`)}</th>
              <th className="text-left p-3 min-w-[120px]">{i18n._(msg`Role`)}</th>
              <th className="text-left p-3 min-w-[120px]">{i18n._(msg`Department`)}</th>
              <th className="text-left p-3 min-w-[100px]">{i18n._(msg`Status`)}</th>
              <th className="text-left p-3 min-w-[100px]">{i18n._(msg`Actions`)}</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedItems.length === 0 ? (
              <tr>
                <td className="p-4" colSpan={7}>
                  {i18n._(msg`No employees found`)}
                </td>
              </tr>
            ) : (
              filteredAndSortedItems.map((e) => (
                <tr
                  key={e.id}
                  className="border-b border-[var(--border)] hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={(event) => handleRowClick(e, event)}
                >
                  <td className="p-3 min-w-[48px]">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(e.id)}
                      onChange={() => toggleSelect(e.id)}
                      className="h-4 w-4 rounded border-[var(--border)]"
                    />
                  </td>
                  <td className="p-3 min-w-[200px]">{e.full_name}</td>
                  <td className="p-3 min-w-[180px]">{e.email}</td>
                  <td className="p-3 min-w-[120px]">
                    <span className="text-sm font-medium">
                      {ROLE_DISPLAY_NAMES[e.role as keyof typeof ROLE_DISPLAY_NAMES] || e.role}
                    </span>
                  </td>
                  <td className="p-3 min-w-[120px]">{e.department || "-"}</td>
                  <td className="p-3 min-w-[100px]">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        e.is_active
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {e.is_active ? i18n._(msg`Active`) : i18n._(msg`Inactive`)}
                    </span>
                  </td>
                  <td className="p-3 min-w-[100px]">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(event) => event.stopPropagation()}
                          className="h-8 w-8 p-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(event) => {
                            event.stopPropagation();
                            setViewingEmployee(e);
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          {i18n._(msg`View Details`)}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(event) => {
                            event.stopPropagation();
                            if (e.id) {
                              router.push(`/dashboard/employees/${e.id}`);
                            } else {
                              showToast({
                                type: "error",
                                message: i18n._(msg`Cannot edit employee: Invalid employee ID`),
                              });
                            }
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          {i18n._(msg`Edit`)}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(event) => {
                            event.stopPropagation();
                            if (e.is_active) {
                              // Show warning dialog for deactivation
                              setEmployeeToDeactivate(e);
                              setDeactivateOpen(true);
                            } else {
                              // Direct activation without warning
                              handleToggleStatus(e.id, e.is_active);
                            }
                          }}
                        >
                          {e.is_active ? (
                            <>
                              <UserX className="mr-2 h-4 w-4" />
                              {i18n._(msg`Deactivate`)}
                            </>
                          ) : (
                            <>
                              <UserCheck className="mr-2 h-4 w-4" />
                              {i18n._(msg`Activate`)}
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(event) => {
                            event.stopPropagation();
                            setDeletingEmployee(e);
                          }}
                          className="text-red-400 focus:text-red-400"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {i18n._(msg`Delete`)}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Employee View Dialog */}
      {viewingEmployee && (
        <EmployeeViewDialog
          employee={viewingEmployee}
          open={!!viewingEmployee}
          onOpenChange={(open) => !open && setViewingEmployee(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deletingEmployee && (
        <DeleteEmployeeDialog
          employee={deletingEmployee}
          open={!!deletingEmployee}
          onOpenChange={(open: boolean) => !open && setDeletingEmployee(null)}
          onConfirm={() => handleDelete(deletingEmployee)}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Bulk Delete Dialog */}
      {showBulkDelete && (
        <DeleteEmployeeDialog
          employee={{
            id: "",
            full_name: i18n._(msg`${selectedIds.size} employees`),
            email: "",
            role: "employee",
            company_id: "",
            is_active: true,
            created_at: "",
            updated_at: "",
            is_employee: true,
            can_login: true,
          }}
          open={showBulkDelete}
          onOpenChange={setShowBulkDelete}
          onConfirm={handleBulkDelete}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Deactivate Confirmation Dialog */}
      <ConfirmationDialog
        open={deactivateOpen}
        onOpenChange={(open) => {
          setDeactivateOpen(open);
          if (!open) setEmployeeToDeactivate(null);
        }}
        title={i18n._(msg`Deactivate Employee?`)}
        description={i18n._(msg`Are you sure you want to deactivate "${employeeToDeactivate?.full_name || employeeToDeactivate?.email}"? This will prevent the employee from logging into the system and accessing their account. The employee can be reactivated later if needed.`)}
        confirmText={i18n._(msg`Deactivate`)}
        cancelText={i18n._(msg`Cancel`)}
        onConfirm={handleDeactivateConfirm}
        variant="destructive"
      />
    </div>
  );
}
