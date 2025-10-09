export interface Paystub {
  id: string
  payroll_run_id: string
  employee_id: string
  pay_period_start: string // ISO date
  pay_period_end: string // ISO date
  pay_date: string // ISO date
  regular_hours: number
  regular_rate: number
  regular_pay: number
  overtime_hours: number
  overtime_rate: number
  overtime_pay: number
  bonus_pay: number
  commission_pay: number
  gross_pay: number
  total_deductions: number
  net_pay: number
  ytd_gross_pay: number
  ytd_deductions: number
  ytd_net_pay: number
  status?: 'draft' | 'published' | 'paid'
  created_at: string
  updated_at: string
  created_by: string
  updated_by: string
}

export interface PaystubDetail extends Paystub {
  deductions?: Array<{
    name: string
    amount: number
  }>
  earnings?: Array<{
    name: string
    amount: number
  }>
}

export interface ActionResult {
  success?: boolean
  data?: unknown
  errors?: {
    _form?: string[]
    [key: string]: string[] | undefined
  }
}
