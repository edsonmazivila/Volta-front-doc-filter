"use client";
import { useState, useMemo } from "react";
import {
  type Employee,
  type EmployeeListParams,
  deleteEmployeeAction,
} from "@/lib/services/employees";
import { Button } from "@/components/ui";
import { SearchInput } from "@/components/search-input";
import { DeleteEmployeeDialog } from "./delete-employee-dialog";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EmployeeTableProps {
  initialEmployees: Employee[];
  initialTotal: number;
}

export function EmployeeTable({ initialEmployees }: EmployeeTableProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<EmployeeListParams["status"]>("all");
  const [department, setDepartment] = useState("");
  const [sort, setSort] = useState<EmployeeListParams["sort"]>("name");
  const [order, setOrder] = useState<EmployeeListParams["order"]>("asc");

  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Bulk actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkDelete, setShowBulkDelete] = useState(false);

  const handleDelete = async (employee: Employee) => {
    setIsSubmitting(true);
    try {
      await deleteEmployeeAction(employee.id);
      showToast({ type: "success", message: "Employee deleted successfully" });
      setDeletingEmployee(null);
      router.refresh();
    } catch {
      showToast({ type: "error", message: "Failed to delete employee" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkDelete = async () => {
    setIsSubmitting(true);
    try {
      // Use Promise.allSettled to handle partial failures gracefully
      const results = await Promise.allSettled(
        Array.from(selectedIds).map((id) => deleteEmployeeAction(id))
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
          message: `Successfully deleted ${succeeded} employee${succeeded > 1 ? "s" : ""}`,
        });
      } else if (succeeded === 0) {
        showToast({
          type: "error",
          message: `Failed to delete all ${failed} employees. Please try again.`,
        });
      } else {
        showToast({
          type: "warning",
          message: `Deleted ${succeeded} employee${succeeded > 1 ? "s" : ""}, but ${failed} failed. Please review and retry.`,
        });
      }
    } catch {
      showToast({ type: "error", message: "An unexpected error occurred" });
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

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      let compareValue = 0;

      switch (sort) {
        case "name":
          compareValue = (a.full_name || '').localeCompare(b.full_name || '');
          break;
        case "status":
          compareValue = a.is_active === b.is_active ? 0 : a.is_active ? -1 : 1;
          break;
        case "department":
          compareValue = (a.department || "").localeCompare(b.department || "");
          break;
      }

      return order === "asc" ? compareValue : -compareValue;
    });

    return sorted;
  }, [initialEmployees, query, department, status, sort, order]);

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
        <div className="p-3 bg-blue-500/10 border-b border-blue-500/20 flex items-center justify-between">
          <span className="text-sm font-medium">
            {selectedIds.size} selected
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedIds(new Set())}
            >
              Clear
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowBulkDelete(true)}
            >
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="p-3 flex items-center gap-2 border-b border-[var(--border)] flex-wrap">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search employees"
        />
		<Select value={department || 'all'} onValueChange={(v)=> setDepartment(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-[180px] bg-background border-[var(--border)]">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent className="bg-background border-[var(--border)]">
				<SelectItem value="all">All Departments</SelectItem>
				{departments.map((dept) => {
					const val = String(dept || '')
					return (<SelectItem key={val} value={val}>{val}</SelectItem>)
				})}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => setStatus(v as EmployeeListParams["status"]) }>
          <SelectTrigger className="w-[150px] bg-background border-[var(--border)]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-background border-[var(--border)]">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v as EmployeeListParams["sort"]) }>
          <SelectTrigger className="w-[160px] bg-background border-[var(--border)]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-background border-[var(--border)]">
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="status">Status</SelectItem>
            <SelectItem value="department">Department</SelectItem>
          </SelectContent>
        </Select>
        <Select value={order} onValueChange={(v) => setOrder(v as EmployeeListParams["order"]) }>
          <SelectTrigger className="w-[120px] bg-background border-[var(--border)]">
            <SelectValue placeholder="Order" />
          </SelectTrigger>
          <SelectContent className="bg-background border-[var(--border)]">
            <SelectItem value="asc">Asc</SelectItem>
            <SelectItem value="desc">Desc</SelectItem>
          </SelectContent>
        </Select>
        <Button
          size="sm"
          onClick={() => router.push('/dashboard/employees/new')}
          className="ml-auto"
        >
          Add Employee
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-[var(--border)] text-neutral-400">
            <tr>
              <th className="w-12 p-3">
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
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Department</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedItems.length === 0 ? (
              <tr>
                <td className="p-4" colSpan={6}>
                  No employees found
                </td>
              </tr>
            ) : (
              filteredAndSortedItems.map((e) => (
                <tr key={e.id} className="border-b border-[var(--border)]">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(e.id)}
                      onChange={() => toggleSelect(e.id)}
                      className="h-4 w-4 rounded border-[var(--border)]"
                    />
                  </td>
                  <td className="p-3">
                    {e.full_name}
                  </td>
                  <td className="p-3">{e.email}</td>
                  <td className="p-3">{e.department || "-"}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        e.is_active
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {e.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => router.push(`/dashboard/employees/${e.id}`)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeletingEmployee(e)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
            full_name: `${selectedIds.size} employees`,
            email: "",
            employment_status: "active",
            is_active: true,
          }}
          open={showBulkDelete}
          onOpenChange={setShowBulkDelete}
          onConfirm={handleBulkDelete}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
