export type MyTimesheetStatus = 'draft' | 'submitted' | 'approved' | 'rejected'

export interface MyTimesheet {
  id: string
  period_start: string
  period_end: string
  status: MyTimesheetStatus
  total_hours: number
  submitted_at?: string
  notes?: string
  created_at?: string
  updated_at?: string
}

export interface MyTimesheetEntry {
  id: string
  timesheet_id: string
  date: string
  hours: number
  description?: string
  project?: string
}