export interface Paystub {
  id: string
  employee_id: string
  pay_period_start: string // ISO date
  pay_period_end: string // ISO date
  pay_date: string // ISO date
  regular_hours: number
  overtime_hours?: number
  regular_pay: number
  overtime_pay?: number
  gross_pay: number
  total_deductions: number
  net_pay: number
  status?: 'draft' | 'published' | 'paid'
  created_at?: string
  updated_at?: string
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
