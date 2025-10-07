'use client'

import { useActionState, useState } from 'react'
import { createAttendanceAction, updateAttendanceAction } from '@/lib/services/attendance'
import type { AttendanceRecord } from '@/lib/types/attendance'
import type { Employee } from '@/lib/services/employees'
import { Button } from '@/components/ui'
import { Input } from '../ui/input'
import { toast } from 'sonner'

interface AttendanceFormProps {
  employees: Employee[]
  editRecord?: AttendanceRecord
  onSuccess?: () => void
  onCancel?: () => void
}

export function AttendanceForm({ employees, editRecord, onSuccess, onCancel }: AttendanceFormProps) {
  const [createState, createAction, createPending] = useActionState(
    createAttendanceAction,
    null
  )

  const [updateState, updateAction, updatePending] = useActionState(
    async (_prevState: unknown, formData: FormData) =>
      editRecord ? updateAttendanceAction(_prevState, editRecord.id, formData) : { errors: { _form: ['No record'] } },
    null
  )

  const state = editRecord ? updateState : createState
  const formAction = editRecord ? updateAction : createAction
  const pending = editRecord ? updatePending : createPending

  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [selectedStatus, setSelectedStatus] = useState(editRecord?.status || 'present')

  // Handle success
  if (state && 'success' in state && state.success) {
    toast.success(editRecord ? 'Attendance updated' : 'Attendance recorded')
    onSuccess?.()
  }

  return (
    <form action={formAction} className="space-y-4">
      {/* Employee Selection */}
      {!editRecord && (
        <div>
          <label htmlFor="employee_id" className="block text-sm font-medium mb-2">
            Employee *
          </label>
          <select
            name="employee_id"
            id="employee_id"
            required
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary [&_option]:bg-background [&_option]:text-foreground"
          >
            <option value="" className="bg-background text-foreground">Select employee</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id} className="bg-background text-foreground">
                {emp.first_name} {emp.last_name} - {emp.email}
              </option>
            ))}
          </select>
          {state && 'errors' in state && state.errors && 'employee_id' in state.errors && state.errors.employee_id && (
            <p className="text-sm text-red-500 mt-1">{state.errors.employee_id[0]}</p>
          )}
        </div>
      )}

      {/* Date */}
      <div>
        <label htmlFor="date" className="block text-sm font-medium mb-2">
          Date *
        </label>
        <Input
          type="date"
          name="date"
          id="date"
          required
          defaultValue={editRecord?.date || new Date().toISOString().split('T')[0]}
        />
        {state && 'errors' in state && state.errors && 'date' in state.errors && state.errors.date && (
          <p className="text-sm text-red-500 mt-1">{state.errors.date[0]}</p>
        )}
      </div>

      {/* Status */}
      <div>
        <label htmlFor="status" className="block text-sm font-medium mb-2">
          Status *
        </label>
        <select
          name="status"
          id="status"
          required
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as AttendanceRecord['status'])}
          className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary [&_option]:bg-background [&_option]:text-foreground"
        >
          <option value="present" className="bg-background text-foreground">Present</option>
          <option value="absent" className="bg-background text-foreground">Absent</option>
          <option value="late" className="bg-background text-foreground">Late</option>
          <option value="half_day" className="bg-background text-foreground">Half Day</option>
          <option value="on_leave" className="bg-background text-foreground">On Leave</option>
        </select>
        {state && 'errors' in state && state.errors && 'status' in state.errors && state.errors.status && (
          <p className="text-sm text-red-500 mt-1">{state.errors.status[0]}</p>
        )}
      </div>

      {/* Clock In/Out Times */}
      {(selectedStatus === 'present' || selectedStatus === 'late' || selectedStatus === 'half_day') && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="clock_in" className="block text-sm font-medium mb-2">
              Clock In
            </label>
            <Input
              type="time"
              name="clock_in"
              id="clock_in"
              defaultValue={editRecord?.clock_in}
            />
          </div>
          <div>
            <label htmlFor="clock_out" className="block text-sm font-medium mb-2">
              Clock Out
            </label>
            <Input
              type="time"
              name="clock_out"
              id="clock_out"
              defaultValue={editRecord?.clock_out}
            />
          </div>
        </div>
      )}

      {/* Justification */}
      {(selectedStatus === 'absent' || selectedStatus === 'late') && (
        <div>
          <label htmlFor="justification" className="block text-sm font-medium mb-2">
            Justification
          </label>
          <textarea
            name="justification"
            id="justification"
            rows={3}
            className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            defaultValue={editRecord?.justification}
            placeholder="Provide a reason..."
          />
          {state && 'errors' in state && state.errors && 'justification' in state.errors && state.errors.justification && (
            <p className="text-sm text-red-500 mt-1">{state.errors.justification[0]}</p>
          )}
        </div>
      )}

      {/* Error Message */}
      {state && 'errors' in state && state.errors?._form && (
        <div className="rounded-lg bg-red-50 p-4">
          <p className="text-sm text-red-800">{state.errors._form[0]}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={pending}>
          {pending ? 'Saving...' : editRecord ? 'Update' : 'Record Attendance'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
