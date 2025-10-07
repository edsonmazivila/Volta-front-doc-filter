export interface AttendanceRecord {
  id: number
  employee_id: number
  employee_name?: string
  date: string
  status: 'present' | 'absent' | 'late' | 'half_day' | 'on_leave'
  clock_in?: string
  clock_out?: string
  hours_worked?: number
  justification?: string
  justification_status?: 'pending' | 'approved' | 'rejected'
  created_at?: string
  updated_at?: string
}

export interface AttendanceStats {
  total_employees: number
  present_today: number
  absent_today: number
  pending_justifications: number
  average_attendance_rate: number
}

export interface AttendanceJustification {
  id: number
  attendance_id: number
  employee_id: number
  employee_name?: string
  date: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  reviewed_by?: number
  reviewed_at?: string
}

export interface CreateAttendanceInput {
  employee_id: number
  date: string
  status: 'present' | 'absent' | 'late' | 'half_day' | 'on_leave'
  clock_in?: string
  clock_out?: string
  justification?: string
}

export interface UpdateAttendanceInput {
  status?: 'present' | 'absent' | 'late' | 'half_day' | 'on_leave'
  clock_in?: string
  clock_out?: string
  justification?: string
}

export interface AttendanceFilters {
  month?: string
  employee_id?: number
  status?: string
}
