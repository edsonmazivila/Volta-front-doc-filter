DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'volta-front') THEN
    EXECUTE 'CREATE DATABASE "volta-front"';
  END IF;
END
$$;

\connect "volta-front";

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE user_role AS ENUM (
  'platform_owner',
  'organization_admin',
  'system_admin',
  'hr_manager',
  'payroll_manager',
  'operational_manager',
  'employee'
);

CREATE TYPE organization_tier AS ENUM ('standard', 'premium', 'enterprise');
CREATE TYPE organization_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE timesheet_status AS ENUM ('draft', 'submitted', 'approved', 'rejected');
CREATE TYPE leave_status AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'CANCELLED');
CREATE TYPE document_status AS ENUM ('uploaded', 'approved', 'rejected', 'expired', 'pending');
CREATE TYPE meeting_status AS ENUM ('scheduled', 'cancelled', 'completed');
CREATE TYPE participant_status AS ENUM ('pending', 'accepted', 'declined');
CREATE TYPE notification_status AS ENUM ('unread', 'read', 'deleted');
CREATE TYPE notification_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'half_day', 'on_leave', 'justified');
CREATE TYPE justification_status AS ENUM ('pending', 'approved', 'rejected', 'justified');
CREATE TYPE pay_schedule_frequency AS ENUM ('weekly', 'biweekly', 'semimonthly', 'monthly');
CREATE TYPE paystub_status AS ENUM ('draft', 'published', 'paid');
CREATE TYPE tax_calculation_type AS ENUM ('percentage', 'fixed_amount', 'progressive', 'custom');
CREATE TYPE tax_category AS ENUM ('social_security', 'income_tax', 'payroll_tax', 'other');

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  tier organization_tier NOT NULL DEFAULT 'standard',
  approval_status organization_status NOT NULL DEFAULT 'pending',
  approval_notes TEXT,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  business_email TEXT NOT NULL,
  country CHAR(2) NOT NULL,
  tax_id TEXT,
  legal_name TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  phone TEXT,
  website TEXT,
  logo_path TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_company_org_name UNIQUE (organization_id, name)
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  email TEXT UNIQUE,
  password_hash TEXT,
  full_name TEXT NOT NULL,
  role user_role NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  can_login BOOLEAN NOT NULL DEFAULT TRUE,
  avatar TEXT,
  profile_photo_url TEXT,
  last_login TIMESTAMPTZ,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  is_employee BOOLEAN NOT NULL DEFAULT TRUE,
  department_id UUID,
  employee_number TEXT,
  employment_type TEXT,
  employment_status TEXT,
  hire_date DATE,
  termination_date DATE,
  job_title TEXT,
  manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
  date_of_birth DATE,
  phone_primary TEXT,
  phone_secondary TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country CHAR(2),
  tax_filing_status TEXT,
  tax_allowances NUMERIC(10,2),
  additional_tax_withholding NUMERIC(12,2),
  tax_exempt BOOLEAN,
  bank_name TEXT,
  bank_account_type TEXT,
  pay_type TEXT,
  pay_frequency pay_schedule_frequency,
  annual_salary NUMERIC(14,2),
  hourly_rate NUMERIC(12,4),
  standard_hours NUMERIC(10,2),
  overtime_rate NUMERIC(12,4),
  compensation_effective_date DATE,
  compensation_end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_company_employee_number UNIQUE (company_id, employee_number)
);

ALTER TABLE organizations
  ADD CONSTRAINT fk_organizations_approved_by
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;

CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
  parent_department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_department_company_name UNIQUE (company_id, name)
);

ALTER TABLE users
  ADD CONSTRAINT fk_users_department
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL;

CREATE TABLE auth_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  refresh_token TEXT UNIQUE,
  user_agent TEXT,
  ip_address INET,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE pay_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  frequency pay_schedule_frequency NOT NULL,
  start_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_pay_schedule_company_name UNIQUE (company_id, name)
);

CREATE TABLE leave_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  policy_type TEXT NOT NULL,
  leave_type TEXT NOT NULL,
  annual_allocation_days NUMERIC(10,2) NOT NULL,
  accrual_rate NUMERIC(10,4) NOT NULL,
  accrual_frequency TEXT NOT NULL,
  allow_carry_over BOOLEAN NOT NULL DEFAULT FALSE,
  max_carry_over_days NUMERIC(10,2) NOT NULL DEFAULT 0,
  carry_over_expiry_months INTEGER NOT NULL DEFAULT 0,
  min_request_days NUMERIC(10,2) NOT NULL DEFAULT 0,
  max_request_days NUMERIC(10,2) NOT NULL DEFAULT 0,
  max_consecutive_days NUMERIC(10,2) NOT NULL DEFAULT 0,
  min_advance_notice_days INTEGER NOT NULL DEFAULT 0,
  requires_manager_approval BOOLEAN NOT NULL DEFAULT FALSE,
  requires_hr_approval BOOLEAN NOT NULL DEFAULT FALSE,
  auto_approval_threshold NUMERIC(10,2) NOT NULL DEFAULT 0,
  allow_half_days BOOLEAN NOT NULL DEFAULT FALSE,
  allow_negative_balance BOOLEAN NOT NULL DEFAULT FALSE,
  effective_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  leave_policy_id UUID REFERENCES leave_policies(id) ON DELETE SET NULL,
  leave_type TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days NUMERIC(10,2) NOT NULL,
  total_hours NUMERIC(10,2),
  is_half_day BOOLEAN NOT NULL DEFAULT FALSE,
  reason TEXT,
  status leave_status NOT NULL DEFAULT 'DRAFT',
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_leave_dates CHECK (end_date >= start_date)
);

CREATE TABLE leave_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  leave_type TEXT NOT NULL,
  period_year INTEGER NOT NULL,
  allocated_days NUMERIC(10,2) NOT NULL DEFAULT 0,
  used_days NUMERIC(10,2) NOT NULL DEFAULT 0,
  pending_days NUMERIC(10,2) NOT NULL DEFAULT 0,
  remaining_days NUMERIC(10,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_leave_balance_employee_type_year UNIQUE (employee_id, leave_type, period_year)
);

CREATE TABLE timesheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  total_hours NUMERIC(10,2) NOT NULL DEFAULT 0,
  regular_hours NUMERIC(10,2) NOT NULL DEFAULT 0,
  overtime_hours NUMERIC(10,2) NOT NULL DEFAULT 0,
  sick_hours NUMERIC(10,2) NOT NULL DEFAULT 0,
  vacation_hours NUMERIC(10,2) NOT NULL DEFAULT 0,
  holiday_hours NUMERIC(10,2) NOT NULL DEFAULT 0,
  status timesheet_status NOT NULL DEFAULT 'draft',
  notes TEXT,
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_timesheet_dates CHECK (pay_period_end >= pay_period_start),
  CONSTRAINT uq_timesheet_user_period UNIQUE (user_id, pay_period_start, pay_period_end)
);

CREATE TABLE attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status attendance_status NOT NULL,
  clock_in TIMESTAMPTZ,
  clock_out TIMESTAMPTZ,
  hours_worked NUMERIC(10,2),
  justification TEXT,
  justification_status justification_status,
  justification_document_url TEXT,
  justification_document_filename TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_attendance_employee_date UNIQUE (employee_id, date)
);

CREATE TABLE attendance_justifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_id UUID NOT NULL REFERENCES attendance_records(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status justification_status NOT NULL DEFAULT 'pending',
  document_url TEXT,
  document_filename TEXT,
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  datetime TIMESTAMPTZ NOT NULL,
  location TEXT,
  status meeting_status NOT NULL DEFAULT 'scheduled',
  organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE meeting_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status participant_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_meeting_participant UNIQUE (meeting_id, user_id)
);

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  document_type TEXT NOT NULL,
  document_status document_status NOT NULL DEFAULT 'uploaded',
  original_filename TEXT,
  stored_filename TEXT,
  file_path TEXT,
  file_size BIGINT,
  mime_type TEXT,
  storage_provider TEXT,
  expiry_date DATE,
  description TEXT,
  is_confidential BOOLEAN NOT NULL DEFAULT FALSE,
  access_level TEXT,
  requires_approval BOOLEAN,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  version INTEGER NOT NULL DEFAULT 1,
  is_current_version BOOLEAN NOT NULL DEFAULT TRUE,
  virus_scan_status TEXT,
  encrypted BOOLEAN,
  download_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE company_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  document_type TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  stored_filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  storage_provider TEXT,
  expiry_date DATE,
  description TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tax_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  tax_code TEXT NOT NULL,
  tax_name TEXT NOT NULL,
  tax_category tax_category,
  description TEXT,
  is_employee_contribution BOOLEAN NOT NULL DEFAULT FALSE,
  is_employer_contribution BOOLEAN NOT NULL DEFAULT FALSE,
  calculation_type tax_calculation_type NOT NULL,
  rate NUMERIC(10,6),
  fixed_amount NUMERIC(14,2),
  wage_base_limit NUMERIC(14,2),
  minimum_threshold NUMERIC(14,2),
  has_brackets BOOLEAN NOT NULL DEFAULT FALSE,
  priority INTEGER NOT NULL DEFAULT 100,
  tax_year INTEGER NOT NULL,
  effective_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_tax_rule_company_code_year UNIQUE (company_id, tax_code, tax_year, effective_date)
);

CREATE TABLE tax_rule_brackets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tax_rule_id UUID NOT NULL REFERENCES tax_rules(id) ON DELETE CASCADE,
  bracket_order INTEGER NOT NULL,
  min_income NUMERIC(14,2) NOT NULL,
  max_income NUMERIC(14,2),
  rate NUMERIC(10,6) NOT NULL,
  base_tax_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_tax_bracket_order UNIQUE (tax_rule_id, bracket_order)
);

CREATE TABLE payroll_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  pay_schedule_id UUID REFERENCES pay_schedules(id) ON DELETE SET NULL,
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  pay_date DATE,
  pay_frequency pay_schedule_frequency,
  status TEXT,
  total_hours NUMERIC(12,2) DEFAULT 0,
  gross_amount NUMERIC(14,2) DEFAULT 0,
  net_amount NUMERIC(14,2),
  taxes_amount NUMERIC(14,2) DEFAULT 0,
  employees_count INTEGER DEFAULT 0,
  processed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_payroll_dates CHECK (pay_period_end >= pay_period_start)
);

CREATE TABLE paystubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_run_id UUID NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  pay_date DATE NOT NULL,
  regular_hours NUMERIC(10,2) NOT NULL DEFAULT 0,
  regular_rate NUMERIC(12,4) NOT NULL DEFAULT 0,
  regular_pay NUMERIC(14,2) NOT NULL DEFAULT 0,
  overtime_hours NUMERIC(10,2) NOT NULL DEFAULT 0,
  overtime_rate NUMERIC(12,4) NOT NULL DEFAULT 0,
  overtime_pay NUMERIC(14,2) NOT NULL DEFAULT 0,
  bonus_pay NUMERIC(14,2) NOT NULL DEFAULT 0,
  commission_pay NUMERIC(14,2) NOT NULL DEFAULT 0,
  gross_pay NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_deductions NUMERIC(14,2) NOT NULL DEFAULT 0,
  net_pay NUMERIC(14,2) NOT NULL DEFAULT 0,
  ytd_gross_pay NUMERIC(14,2) NOT NULL DEFAULT 0,
  ytd_deductions NUMERIC(14,2) NOT NULL DEFAULT 0,
  ytd_net_pay NUMERIC(14,2) NOT NULL DEFAULT 0,
  status paystub_status NOT NULL DEFAULT 'draft',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_paystub_dates CHECK (pay_period_end >= pay_period_start),
  CONSTRAINT uq_paystub_run_employee UNIQUE (payroll_run_id, employee_id)
);

CREATE TABLE paystub_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paystub_id UUID NOT NULL REFERENCES paystubs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC(14,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE paystub_deductions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paystub_id UUID NOT NULL REFERENCES paystubs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC(14,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  message TEXT,
  type TEXT,
  action_url TEXT,
  status notification_status NOT NULL DEFAULT 'unread',
  priority notification_priority NOT NULL DEFAULT 'medium',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_companies_org_id ON companies(organization_id);
CREATE INDEX idx_users_org_id ON users(organization_id);
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_department_id ON users(department_id);
CREATE INDEX idx_departments_company_id ON departments(company_id);
CREATE INDEX idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_leave_requests_date_range ON leave_requests(start_date, end_date);
CREATE INDEX idx_timesheets_user_period ON timesheets(user_id, pay_period_start, pay_period_end);
CREATE INDEX idx_timesheets_status ON timesheets(status);
CREATE INDEX idx_attendance_employee_date ON attendance_records(employee_id, date);
CREATE INDEX idx_attendance_status ON attendance_records(status);
CREATE INDEX idx_documents_employee ON documents(employee_id);
CREATE INDEX idx_documents_status ON documents(document_status);
CREATE INDEX idx_meetings_datetime ON meetings(datetime);
CREATE INDEX idx_meetings_organizer ON meetings(organizer_id);
CREATE INDEX idx_tax_rules_company_year ON tax_rules(company_id, tax_year);
CREATE INDEX idx_payroll_runs_company_period ON payroll_runs(company_id, pay_period_start, pay_period_end);
CREATE INDEX idx_paystubs_employee ON paystubs(employee_id);
CREATE INDEX idx_notifications_user_status ON notifications(user_id, status);
CREATE INDEX idx_password_reset_token_valid ON password_reset_tokens(token, expires_at) WHERE used_at IS NULL;
CREATE INDEX idx_auth_sessions_user_active ON auth_sessions(user_id, expires_at) WHERE revoked_at IS NULL;
