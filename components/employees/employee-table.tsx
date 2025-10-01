"use client";
import { useState, useMemo } from "react";
import {
  type Employee,
  type EmployeeListParams,
  EmployeesService,
} from "@/lib/services/employees";
import { Button } from "@/components/ui";
import { SearchInput } from "@/components/search-input";
import { EditEmployeeDialog } from "./edit-employee-dialog";
import { DeleteEmployeeDialog } from "./delete-employee-dialog";
import { AddEmployeeDialog } from "./add-employee-dialog";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";

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

  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(
    null
  );
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Bulk actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkDelete, setShowBulkDelete] = useState(false);

  const handleAdd = async (data: Partial<Employee>) => {
    setIsSubmitting(true);
    try {
      await EmployeesService.create(data);
      showToast({ type: "success", message: "Employee created successfully" });
      setShowAddDialog(false);
      router.refresh();
    } catch (error) {
      showToast({ type: "error", message: "Failed to create employee" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (employee: Employee, updates: Partial<Employee>) => {
    setIsSubmitting(true);
    try {
      await EmployeesService.update(employee.id, updates);
      showToast({ type: "success", message: "Employee updated successfully" });
      setEditingEmployee(null);
      router.refresh();
    } catch (error) {
      showToast({ type: "error", message: "Failed to update employee" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (employee: Employee) => {
    setIsSubmitting(true);
    try {
      await EmployeesService.remove(employee.id);
      showToast({ type: "success", message: "Employee deleted successfully" });
      setDeletingEmployee(null);
      router.refresh();
    } catch (error) {
      showToast({ type: "error", message: "Failed to delete employee" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkDelete = async () => {
    setIsSubmitting(true);
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) => EmployeesService.remove(id))
      );
      showToast({
        type: "success",
        message: `Deleted ${selectedIds.size} employees`,
      });
      setSelectedIds(new Set());
      setShowBulkDelete(false);
      router.refresh();
    } catch (error) {
      showToast({ type: "error", message: "Failed to delete some employees" });
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
        `${e.first_name} ${e.last_name} ${e.email} ${e.department || ""}`
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
          compareValue = `${a.first_name} ${a.last_name}`.localeCompare(
            `${b.first_name} ${b.last_name}`
          );
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
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="rounded-md bg-background border border-[var(--border)] px-3 py-2"
        >
          <option value="">All Departments</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value as EmployeeListParams["status"])
          }
          className="rounded-md bg-background border border-[var(--border)] px-3 py-2"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select
          value={sort}
          onChange={(e) =>
            setSort(e.target.value as EmployeeListParams["sort"])
          }
          className="rounded-md bg-background border border-[var(--border)] px-3 py-2"
        >
          <option value="name">Name</option>
          <option value="status">Status</option>
          <option value="department">Department</option>
        </select>
        <select
          value={order}
          onChange={(e) =>
            setOrder(e.target.value as EmployeeListParams["order"])
          }
          className="rounded-md bg-background border border-[var(--border)] px-3 py-2"
        >
          <option value="asc">Asc</option>
          <option value="desc">Desc</option>
        </select>
        <Button
          size="sm"
          onClick={() => setShowAddDialog(true)}
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
                    {e.first_name} {e.last_name}
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
                        onClick={() => setEditingEmployee(e)}
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

      {/* Edit Dialog */}
      {editingEmployee && (
        <EditEmployeeDialog
          employee={editingEmployee}
          open={!!editingEmployee}
          onOpenChange={(open) => !open && setEditingEmployee(null)}
          onSave={(updates) => handleEdit(editingEmployee, updates)}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Add Dialog */}
      <AddEmployeeDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSave={handleAdd}
        isSubmitting={isSubmitting}
      />

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
            first_name: `${selectedIds.size} employees`,
            last_name: "",
            email: "",
            department: "",
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
