export interface AttendanceRecord {
  id: string
  employee_id: string
  employee_name?: string
  date: string
  status: 'present' | 'absent' | 'late' | 'half_day' | 'on_leave' | 'justified'
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
  id: string
  attendance_id: string
  employee_id: string
  employee_name?: string
  date: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  reviewed_by?: number
  reviewed_at?: string
}

export interface CreateAttendanceInput {
  employee_id: string
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
  employee_id?: string
  status?: string
}
