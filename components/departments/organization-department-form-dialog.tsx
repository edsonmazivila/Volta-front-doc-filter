'use client'

import React, { useState, useActionState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { createDepartmentAction } from '@/lib/services/departments'
import type { Company } from '@/lib/types/organization'
import { useLingui } from '@lingui/react'
import { msg } from '@lingui/core/macro'
import { Building2, UserCheck } from 'lucide-react'

interface OrganizationDepartmentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  companies: Company[]
}

interface Manager {
  id: string
  full_name: string
  email: string
}

interface Department {
  id: string
  name: string
  parent_department_id?: string | null
}

export function OrganizationDepartmentFormDialog({
  open,
  onOpenChange,
  companies
}: OrganizationDepartmentFormDialogProps) {
  const { showToast } = useToast()
  const { i18n } = useLingui()
  const [selectedCompany, setSelectedCompany] = useState('')
  const [managers, setManagers] = useState<Manager[]>([])
  const [loadingManagers, setLoadingManagers] = useState(false)
  const [departments, setDepartments] = useState<Department[]>([])
  const [loadingDepartments, setLoadingDepartments] = useState(false)

  const [state, action, pending] = useActionState(createDepartmentAction, null)

  // Fetch managers and departments when company changes
  useEffect(() => {
    if (!selectedCompany) {
      setManagers([])
      setDepartments([])
      return
    }

    const fetchManagersAndDepartments = async () => {
      setLoadingManagers(true)
      setLoadingDepartments(true)
      try {
        // Fetch managers
        const managersResponse = await fetch(`/api/proxy/users?company_id=${selectedCompany}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        })
        
        if (managersResponse.ok) {
          const data = await managersResponse.json()
          const users = Array.isArray(data) ? data : (data.data || [])
          const employees = users.filter((u: { is_employee?: boolean }) => u.is_employee !== false)
          setManagers(employees.map((u: { id: string; full_name: string; email: string }) => ({
            id: u.id,
            full_name: u.full_name,
            email: u.email
          })))
        } else {
          console.error('Failed to fetch employees:', managersResponse.status)
          setManagers([])
        }

        // Fetch departments for this company
        const deptsResponse = await fetch(`/api/proxy/departments?company_id=${selectedCompany}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        })
        
        if (deptsResponse.ok) {
          const data = await deptsResponse.json()
          const depts = Array.isArray(data) ? data : (data.data || data.departments || [])
          setDepartments(depts.map((d: { id: string; name: string; parent_department_id?: string | null }) => ({
            id: d.id,
            name: d.name,
            parent_department_id: d.parent_department_id
          })))
        } else {
          console.error('Failed to fetch departments:', deptsResponse.status)
          setDepartments([])
        }
      } catch (error) {
        console.error('Failed to fetch managers/departments:', error)
        setManagers([])
        setDepartments([])
      } finally {
        setLoadingManagers(false)
        setLoadingDepartments(false)
      }
    }

    fetchManagersAndDepartments()
  }, [selectedCompany])

  // Handle success
  React.useEffect(() => {
    if (state && 'success' in state && state.success) {
      showToast({
        type: 'success',
        message: i18n._(msg`Department created successfully`),
        title: i18n._(msg`Success`),
      })
      onOpenChange(false)
      // Reset form
      setSelectedCompany('')
      // Refresh the page to show new department
      window.location.reload()
    }
  }, [state, showToast, i18n, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Create New Department
          </DialogTitle>
          <DialogDescription>
            Create a department for any company in your organization. Select the company and provide department details.
          </DialogDescription>
        </DialogHeader>

        <form action={action} className="space-y-4">
          {/* Company Selection */}
          <div>
            <label htmlFor="company_id" className="block text-sm font-medium text-foreground mb-1">
              Company <span className="text-red-500">*</span>
            </label>
            <select
              id="company_id"
              name="company_id"
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              required
            >
              <option value="">Select a company...</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>
                  {company.name} {company.country ? `(${company.country})` : ''}
                </option>
              ))}
            </select>
            {state && 'errors' in state && state.errors?.company_id && (
              <p className="text-sm text-red-600 mt-1">{state.errors.company_id[0]}</p>
            )}
          </div>

          {/* Department Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
              Department Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="e.g. Engineering, Sales, HR"
              required
            />
            {state && 'errors' in state && state.errors?.name && (
              <p className="text-sm text-red-600 mt-1">{state.errors.name[0]}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="Brief description of the department"
              rows={3}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {state && 'errors' in state && state.errors?.description && (
              <p className="text-sm text-red-600 mt-1">{state.errors.description[0]}</p>
            )}
          </div>

          {/* Manager Selection */}
          <div>
            <label htmlFor="manager_id" className="block text-sm font-medium text-foreground mb-1 flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Department Manager
            </label>
            <select
              id="manager_id"
              name="manager_id"
              disabled={!selectedCompany || loadingManagers}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">
                {!selectedCompany 
                  ? 'Select a company first...' 
                  : loadingManagers 
                    ? 'Loading employees...' 
                    : 'No manager (optional)'}
              </option>
              {managers.map(manager => (
                <option key={manager.id} value={manager.id}>
                  {manager.full_name} ({manager.email})
                </option>
              ))}
            </select>
            {state && 'errors' in state && state.errors?.manager_id && (
              <p className="text-sm text-red-600 mt-1">{state.errors.manager_id[0]}</p>
            )}
            {selectedCompany && managers.length === 0 && !loadingManagers && (
              <p className="text-sm text-muted-foreground mt-1">
                No employees found in this company. You can assign a manager later.
              </p>
            )}
          </div>

          {/* Parent Department Selection */}
          <div>
            <label htmlFor="parent_department_id" className="block text-sm font-medium text-foreground mb-1">
              Parent Department (optional)
            </label>
            <select
              id="parent_department_id"
              name="parent_department_id"
              disabled={!selectedCompany || loadingDepartments}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">
                {!selectedCompany 
                  ? 'Select a company first...' 
                  : loadingDepartments 
                    ? 'Loading departments...' 
                    : 'No parent department (top-level)'}
              </option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
            {state && 'errors' in state && state.errors?.parent_department_id && (
              <p className="text-sm text-red-600 mt-1">{state.errors.parent_department_id[0]}</p>
            )}
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              defaultChecked={true}
              className="h-4 w-4 rounded border-input"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-foreground">
              Active
            </label>
          </div>

          {/* Error Message */}
          {state && 'errors' in state && state.errors?._form && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{state.errors._form[0]}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={pending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={pending || !selectedCompany}
              className="flex-1"
            >
              {pending ? 'Creating...' : 'Create Department'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
