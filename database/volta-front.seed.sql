\connect "volta-front";

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- IDs fixos para seed idempotente
-- ============================================================================
-- organization: 11111111-1111-1111-1111-111111111111
-- company:      22222222-2222-2222-2222-222222222222
-- admin user:   33333333-3333-3333-3333-333333333333
-- hr manager:   44444444-4444-4444-4444-444444444444
-- employee 1:   55555555-5555-5555-5555-555555555555
-- employee 2:   66666666-6666-6666-6666-666666666666

-- ============================================================================
-- Organização + Empresa
-- ============================================================================
INSERT INTO organizations (
  id,
  name,
  is_active,
  tier,
  approval_status,
  approval_notes,
  created_at,
  updated_at
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Volta Group',
  TRUE,
  'premium',
  'approved',
  'Seed organization approved for local development',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  is_active = EXCLUDED.is_active,
  tier = EXCLUDED.tier,
  approval_status = EXCLUDED.approval_status,
  approval_notes = EXCLUDED.approval_notes,
  updated_at = NOW();

INSERT INTO companies (
  id,
  organization_id,
  name,
  business_email,
  country,
  tax_id,
  legal_name,
  address_line1,
  city,
  state,
  postal_code,
  phone,
  website,
  is_active,
  created_at,
  updated_at
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'Volta Front Company',
  'business@volta.local',
  'PT',
  'PT-999999999',
  'Volta Front, Lda',
  'Rua Principal 100',
  'Lisboa',
  'Lisboa',
  '1000-001',
  '+351910000000',
  'https://volta.local',
  TRUE,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  business_email = EXCLUDED.business_email,
  country = EXCLUDED.country,
  tax_id = EXCLUDED.tax_id,
  legal_name = EXCLUDED.legal_name,
  address_line1 = EXCLUDED.address_line1,
  city = EXCLUDED.city,
  state = EXCLUDED.state,
  postal_code = EXCLUDED.postal_code,
  phone = EXCLUDED.phone,
  website = EXCLUDED.website,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- ============================================================================
-- Utilizadores (senha seed: Admin@123)
-- ============================================================================
INSERT INTO users (
  id,
  organization_id,
  company_id,
  email,
  password_hash,
  full_name,
  role,
  is_active,
  can_login,
  is_employee,
  employee_number,
  employment_type,
  employment_status,
  hire_date,
  job_title,
  country,
  pay_type,
  pay_frequency,
  annual_salary,
  standard_hours,
  overtime_rate,
  created_at,
  updated_at
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  'admin@volta.local',
  crypt('Admin@123', gen_salt('bf')),
  'Volta Admin',
  'organization_admin',
  TRUE,
  TRUE,
  TRUE,
  'EMP-0001',
  'full_time',
  'active',
  CURRENT_DATE - INTERVAL '24 months',
  'Organization Admin',
  'PT',
  'salary',
  'monthly',
  42000,
  160,
  1.50,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  can_login = EXCLUDED.can_login,
  updated_at = NOW();

INSERT INTO users (
  id,
  organization_id,
  company_id,
  email,
  password_hash,
  full_name,
  role,
  is_active,
  can_login,
  is_employee,
  employee_number,
  employment_type,
  employment_status,
  hire_date,
  job_title,
  country,
  pay_type,
  pay_frequency,
  annual_salary,
  standard_hours,
  overtime_rate,
  created_by,
  updated_by,
  created_at,
  updated_at
) VALUES (
  '44444444-4444-4444-4444-444444444444',
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  'hr@volta.local',
  crypt('Admin@123', gen_salt('bf')),
  'Helena RH',
  'hr_manager',
  TRUE,
  TRUE,
  TRUE,
  'EMP-0002',
  'full_time',
  'active',
  CURRENT_DATE - INTERVAL '18 months',
  'HR Manager',
  'PT',
  'salary',
  'monthly',
  32000,
  160,
  1.50,
  '33333333-3333-3333-3333-333333333333',
  '33333333-3333-3333-3333-333333333333',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = NOW();

INSERT INTO users (
  id,
  organization_id,
  company_id,
  email,
  password_hash,
  full_name,
  role,
  is_active,
  can_login,
  is_employee,
  employee_number,
  employment_type,
  employment_status,
  hire_date,
  job_title,
  manager_id,
  country,
  pay_type,
  pay_frequency,
  annual_salary,
  standard_hours,
  overtime_rate,
  created_by,
  updated_by,
  created_at,
  updated_at
) VALUES
(
  '55555555-5555-5555-5555-555555555555',
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  'ana.silva@volta.local',
  crypt('Admin@123', gen_salt('bf')),
  'Ana Silva',
  'employee',
  TRUE,
  TRUE,
  TRUE,
  'EMP-1001',
  'full_time',
  'active',
  CURRENT_DATE - INTERVAL '12 months',
  'Software Engineer',
  '44444444-4444-4444-4444-444444444444',
  'PT',
  'salary',
  'monthly',
  26000,
  160,
  1.50,
  '33333333-3333-3333-3333-333333333333',
  '33333333-3333-3333-3333-333333333333',
  NOW(),
  NOW()
),
(
  '66666666-6666-6666-6666-666666666666',
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  'bruno.costa@volta.local',
  crypt('Admin@123', gen_salt('bf')),
  'Bruno Costa',
  'employee',
  TRUE,
  TRUE,
  TRUE,
  'EMP-1002',
  'full_time',
  'active',
  CURRENT_DATE - INTERVAL '10 months',
  'Financial Analyst',
  '44444444-4444-4444-4444-444444444444',
  'PT',
  'salary',
  'monthly',
  24000,
  160,
  1.50,
  '33333333-3333-3333-3333-333333333333',
  '33333333-3333-3333-3333-333333333333',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  manager_id = EXCLUDED.manager_id,
  updated_at = NOW();

-- Aprovação da organização pelo admin seed
UPDATE organizations
SET approved_by = '33333333-3333-3333-3333-333333333333', approved_at = NOW(), updated_at = NOW()
WHERE id = '11111111-1111-1111-1111-111111111111';

-- ============================================================================
-- Departamentos
-- ============================================================================
INSERT INTO departments (
  id,
  company_id,
  name,
  description,
  manager_id,
  parent_department_id,
  is_active,
  created_at,
  updated_at
) VALUES
(
  '77777777-7777-7777-7777-777777777771',
  '22222222-2222-2222-2222-222222222222',
  'Human Resources',
  'HR and talent management',
  '44444444-4444-4444-4444-444444444444',
  NULL,
  TRUE,
  NOW(),
  NOW()
),
(
  '77777777-7777-7777-7777-777777777772',
  '22222222-2222-2222-2222-222222222222',
  'Engineering',
  'Product engineering department',
  '55555555-5555-5555-5555-555555555555',
  NULL,
  TRUE,
  NOW(),
  NOW()
),
(
  '77777777-7777-7777-7777-777777777773',
  '22222222-2222-2222-2222-222222222222',
  'Finance',
  'Financial operations and accounting',
  '66666666-6666-6666-6666-666666666666',
  NULL,
  TRUE,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  manager_id = EXCLUDED.manager_id,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

UPDATE users
SET department_id = '77777777-7777-7777-7777-777777777771', updated_at = NOW()
WHERE id = '44444444-4444-4444-4444-444444444444';

UPDATE users
SET department_id = '77777777-7777-7777-7777-777777777772', updated_at = NOW()
WHERE id = '55555555-5555-5555-5555-555555555555';

UPDATE users
SET department_id = '77777777-7777-7777-7777-777777777773', updated_at = NOW()
WHERE id = '66666666-6666-6666-6666-666666666666';

-- ============================================================================
-- Configurações de empresa (pay schedule, leave policy, tax)
-- ============================================================================
INSERT INTO pay_schedules (
  id,
  company_id,
  name,
  frequency,
  start_date,
  is_active,
  created_at,
  updated_at
) VALUES (
  '88888888-8888-8888-8888-888888888881',
  '22222222-2222-2222-2222-222222222222',
  'Monthly Main Schedule',
  'monthly',
  DATE_TRUNC('month', CURRENT_DATE)::DATE,
  TRUE,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  frequency = EXCLUDED.frequency,
  start_date = EXCLUDED.start_date,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

INSERT INTO leave_policies (
  id,
  company_id,
  name,
  description,
  policy_type,
  leave_type,
  annual_allocation_days,
  accrual_rate,
  accrual_frequency,
  allow_carry_over,
  max_carry_over_days,
  carry_over_expiry_months,
  min_request_days,
  max_request_days,
  max_consecutive_days,
  min_advance_notice_days,
  requires_manager_approval,
  requires_hr_approval,
  auto_approval_threshold,
  allow_half_days,
  allow_negative_balance,
  effective_date,
  is_active,
  created_by,
  updated_by,
  created_at,
  updated_at
) VALUES
(
  '99999999-9999-9999-9999-999999999991',
  '22222222-2222-2222-2222-222222222222',
  'Vacation Policy',
  'Standard annual vacation policy',
  'annual',
  'vacation',
  22,
  1.8333,
  'monthly',
  TRUE,
  5,
  12,
  0.5,
  22,
  15,
  7,
  TRUE,
  FALSE,
  0,
  TRUE,
  FALSE,
  CURRENT_DATE,
  TRUE,
  '33333333-3333-3333-3333-333333333333',
  '33333333-3333-3333-3333-333333333333',
  NOW(),
  NOW()
),
(
  '99999999-9999-9999-9999-999999999992',
  '22222222-2222-2222-2222-222222222222',
  'Sick Leave Policy',
  'Sick leave policy',
  'annual',
  'sick',
  12,
  1,
  'monthly',
  FALSE,
  0,
  0,
  0.5,
  12,
  10,
  0,
  FALSE,
  FALSE,
  2,
  TRUE,
  TRUE,
  CURRENT_DATE,
  TRUE,
  '33333333-3333-3333-3333-333333333333',
  '33333333-3333-3333-3333-333333333333',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  annual_allocation_days = EXCLUDED.annual_allocation_days,
  accrual_rate = EXCLUDED.accrual_rate,
  effective_date = EXCLUDED.effective_date,
  updated_at = NOW();

INSERT INTO tax_rules (
  id,
  company_id,
  tax_code,
  tax_name,
  tax_category,
  description,
  is_employee_contribution,
  is_employer_contribution,
  calculation_type,
  rate,
  fixed_amount,
  wage_base_limit,
  minimum_threshold,
  has_brackets,
  priority,
  tax_year,
  effective_date,
  end_date,
  is_active,
  created_by,
  updated_by,
  created_at,
  updated_at
) VALUES
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
  '22222222-2222-2222-2222-222222222222',
  'SS_EMPLOYEE',
  'Social Security Employee',
  'social_security',
  'Employee social security contribution',
  TRUE,
  FALSE,
  'percentage',
  0.11,
  NULL,
  NULL,
  NULL,
  FALSE,
  10,
  EXTRACT(YEAR FROM CURRENT_DATE)::INT,
  CURRENT_DATE,
  NULL,
  TRUE,
  '33333333-3333-3333-3333-333333333333',
  '33333333-3333-3333-3333-333333333333',
  NOW(),
  NOW()
),
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
  '22222222-2222-2222-2222-222222222222',
  'INCOME_TAX',
  'Income Tax (Progressive)',
  'income_tax',
  'Progressive income tax brackets',
  TRUE,
  FALSE,
  'progressive',
  NULL,
  NULL,
  NULL,
  0,
  TRUE,
  20,
  EXTRACT(YEAR FROM CURRENT_DATE)::INT,
  CURRENT_DATE,
  NULL,
  TRUE,
  '33333333-3333-3333-3333-333333333333',
  '33333333-3333-3333-3333-333333333333',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET
  tax_name = EXCLUDED.tax_name,
  rate = EXCLUDED.rate,
  has_brackets = EXCLUDED.has_brackets,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

INSERT INTO tax_rule_brackets (
  id,
  tax_rule_id,
  bracket_order,
  min_income,
  max_income,
  rate,
  base_tax_amount,
  created_at,
  updated_at
) VALUES
(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
  1,
  0,
  1000,
  0.10,
  0,
  NOW(),
  NOW()
),
(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
  2,
  1000,
  3000,
  0.15,
  100,
  NOW(),
  NOW()
),
(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
  3,
  3000,
  NULL,
  0.20,
  400,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET
  rate = EXCLUDED.rate,
  max_income = EXCLUDED.max_income,
  base_tax_amount = EXCLUDED.base_tax_amount,
  updated_at = NOW();

-- ============================================================================
-- Balances, faltas, documentos, reuniões
-- ============================================================================
INSERT INTO leave_balances (
  id,
  employee_id,
  company_id,
  leave_type,
  period_year,
  allocated_days,
  used_days,
  pending_days,
  remaining_days,
  updated_at
) VALUES
(
  'cccccccc-cccc-cccc-cccc-ccccccccccc1',
  '55555555-5555-5555-5555-555555555555',
  '22222222-2222-2222-2222-222222222222',
  'vacation',
  EXTRACT(YEAR FROM CURRENT_DATE)::INT,
  22,
  4,
  1,
  17,
  NOW()
),
(
  'cccccccc-cccc-cccc-cccc-ccccccccccc2',
  '66666666-6666-6666-6666-666666666666',
  '22222222-2222-2222-2222-222222222222',
  'vacation',
  EXTRACT(YEAR FROM CURRENT_DATE)::INT,
  22,
  2,
  0,
  20,
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET
  allocated_days = EXCLUDED.allocated_days,
  used_days = EXCLUDED.used_days,
  pending_days = EXCLUDED.pending_days,
  remaining_days = EXCLUDED.remaining_days,
  updated_at = NOW();

INSERT INTO leave_requests (
  id,
  employee_id,
  leave_policy_id,
  leave_type,
  start_date,
  end_date,
  total_days,
  total_hours,
  is_half_day,
  reason,
  status,
  submitted_at,
  approved_at,
  approved_by,
  approved_notes,
  created_at,
  updated_at
) VALUES
(
  'dddddddd-dddd-dddd-dddd-ddddddddddd1',
  '55555555-5555-5555-5555-555555555555',
  '99999999-9999-9999-9999-999999999991',
  'vacation',
  CURRENT_DATE + INTERVAL '10 days',
  CURRENT_DATE + INTERVAL '12 days',
  3,
  24,
  FALSE,
  'Family travel',
  'APPROVED',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '1 day',
  '44444444-4444-4444-4444-444444444444',
  'Approved by HR',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '1 day'
),
(
  'dddddddd-dddd-dddd-dddd-ddddddddddd2',
  '66666666-6666-6666-6666-666666666666',
  '99999999-9999-9999-9999-999999999992',
  'sick',
  CURRENT_DATE - INTERVAL '1 day',
  CURRENT_DATE,
  2,
  16,
  FALSE,
  'Medical leave',
  'SUBMITTED',
  NOW() - INTERVAL '6 hours',
  NULL,
  NULL,
  NULL,
  NOW() - INTERVAL '6 hours',
  NOW() - INTERVAL '6 hours'
)
ON CONFLICT (id) DO UPDATE
SET
  status = EXCLUDED.status,
  approved_by = EXCLUDED.approved_by,
  approved_at = EXCLUDED.approved_at,
  approved_notes = EXCLUDED.approved_notes,
  updated_at = NOW();

INSERT INTO timesheets (
  id,
  user_id,
  pay_period_start,
  pay_period_end,
  total_hours,
  regular_hours,
  overtime_hours,
  sick_hours,
  vacation_hours,
  holiday_hours,
  status,
  notes,
  submitted_at,
  approved_at,
  approved_by,
  created_at,
  updated_at
) VALUES
(
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1',
  '55555555-5555-5555-5555-555555555555',
  DATE_TRUNC('month', CURRENT_DATE)::DATE,
  (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '27 days')::DATE,
  168,
  160,
  8,
  0,
  0,
  0,
  'approved',
  'Completed sprint tasks',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '2 days',
  '44444444-4444-4444-4444-444444444444',
  NOW() - INTERVAL '4 days',
  NOW() - INTERVAL '2 days'
),
(
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee2',
  '66666666-6666-6666-6666-666666666666',
  DATE_TRUNC('month', CURRENT_DATE)::DATE,
  (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '27 days')::DATE,
  160,
  152,
  0,
  8,
  0,
  0,
  'submitted',
  'Month close support',
  NOW() - INTERVAL '1 day',
  NULL,
  NULL,
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '1 day'
)
ON CONFLICT (id) DO UPDATE
SET
  status = EXCLUDED.status,
  total_hours = EXCLUDED.total_hours,
  regular_hours = EXCLUDED.regular_hours,
  overtime_hours = EXCLUDED.overtime_hours,
  sick_hours = EXCLUDED.sick_hours,
  vacation_hours = EXCLUDED.vacation_hours,
  holiday_hours = EXCLUDED.holiday_hours,
  updated_at = NOW();

INSERT INTO attendance_records (
  id,
  employee_id,
  date,
  status,
  clock_in,
  clock_out,
  hours_worked,
  justification,
  justification_status,
  created_at,
  updated_at
) VALUES
(
  'f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1',
  '55555555-5555-5555-5555-555555555555',
  CURRENT_DATE,
  'present',
  NOW() - INTERVAL '8 hours',
  NOW(),
  8,
  NULL,
  NULL,
  NOW(),
  NOW()
),
(
  'f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2',
  '66666666-6666-6666-6666-666666666666',
  CURRENT_DATE,
  'late',
  NOW() - INTERVAL '6 hours 30 minutes',
  NOW(),
  6.5,
  'Traffic incident',
  'pending',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET
  status = EXCLUDED.status,
  clock_in = EXCLUDED.clock_in,
  clock_out = EXCLUDED.clock_out,
  hours_worked = EXCLUDED.hours_worked,
  justification = EXCLUDED.justification,
  justification_status = EXCLUDED.justification_status,
  updated_at = NOW();

INSERT INTO attendance_justifications (
  id,
  attendance_id,
  employee_id,
  reason,
  status,
  document_url,
  document_filename,
  reviewed_by,
  reviewed_at,
  created_at,
  updated_at
) VALUES
(
  'abababab-abab-abab-abab-abababababab',
  'f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2',
  '66666666-6666-6666-6666-666666666666',
  'Commute disruption due to road closure',
  'pending',
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET
  reason = EXCLUDED.reason,
  status = EXCLUDED.status,
  updated_at = NOW();

INSERT INTO meetings (
  id,
  company_id,
  title,
  description,
  datetime,
  location,
  status,
  organizer_id,
  created_at,
  updated_at
) VALUES (
  '12121212-1212-1212-1212-121212121212',
  '22222222-2222-2222-2222-222222222222',
  'Monthly Payroll Alignment',
  'Review payroll status and open timesheets',
  NOW() + INTERVAL '2 days',
  'Meeting Room A',
  'scheduled',
  '44444444-4444-4444-4444-444444444444',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  datetime = EXCLUDED.datetime,
  location = EXCLUDED.location,
  status = EXCLUDED.status,
  organizer_id = EXCLUDED.organizer_id,
  updated_at = NOW();

INSERT INTO meeting_participants (
  id,
  meeting_id,
  user_id,
  status,
  created_at,
  updated_at
) VALUES
(
  '13131313-1313-1313-1313-131313131311',
  '12121212-1212-1212-1212-121212121212',
  '55555555-5555-5555-5555-555555555555',
  'accepted',
  NOW(),
  NOW()
),
(
  '13131313-1313-1313-1313-131313131312',
  '12121212-1212-1212-1212-121212121212',
  '66666666-6666-6666-6666-666666666666',
  'pending',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET
  status = EXCLUDED.status,
  updated_at = NOW();

INSERT INTO documents (
  id,
  employee_id,
  title,
  document_type,
  document_status,
  original_filename,
  stored_filename,
  file_path,
  file_size,
  mime_type,
  storage_provider,
  expiry_date,
  description,
  is_confidential,
  access_level,
  requires_approval,
  approved_by,
  approved_at,
  version,
  is_current_version,
  virus_scan_status,
  encrypted,
  download_count,
  created_by,
  updated_by,
  created_at,
  updated_at
) VALUES (
  '14141414-1414-1414-1414-141414141414',
  '55555555-5555-5555-5555-555555555555',
  'Employment Contract',
  'contract',
  'approved',
  'employment_contract_ana.pdf',
  'doc_ana_contract_v1.pdf',
  '/documents/contracts/doc_ana_contract_v1.pdf',
  248576,
  'application/pdf',
  'local',
  NULL,
  'Signed employment contract',
  TRUE,
  'hr_only',
  TRUE,
  '44444444-4444-4444-4444-444444444444',
  NOW() - INTERVAL '20 days',
  1,
  TRUE,
  'clean',
  TRUE,
  4,
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  NOW() - INTERVAL '30 days',
  NOW() - INTERVAL '20 days'
)
ON CONFLICT (id) DO UPDATE
SET
  document_status = EXCLUDED.document_status,
  approved_by = EXCLUDED.approved_by,
  approved_at = EXCLUDED.approved_at,
  download_count = EXCLUDED.download_count,
  updated_at = NOW();

INSERT INTO company_documents (
  id,
  company_id,
  name,
  document_type,
  original_filename,
  stored_filename,
  file_path,
  file_size,
  mime_type,
  storage_provider,
  expiry_date,
  description,
  created_by,
  updated_by,
  created_at,
  updated_at
) VALUES (
  '15151515-1515-1515-1515-151515151515',
  '22222222-2222-2222-2222-222222222222',
  'Company Registration Certificate',
  'legal',
  'company_registration.pdf',
  'company_registration_2026.pdf',
  '/company-documents/legal/company_registration_2026.pdf',
  502120,
  'application/pdf',
  'local',
  CURRENT_DATE + INTERVAL '365 days',
  'Official company registration document',
  '33333333-3333-3333-3333-333333333333',
  '33333333-3333-3333-3333-333333333333',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET
  description = EXCLUDED.description,
  expiry_date = EXCLUDED.expiry_date,
  updated_at = NOW();

-- ============================================================================
-- Payroll + Paystubs
-- ============================================================================
INSERT INTO payroll_runs (
  id,
  company_id,
  pay_schedule_id,
  pay_period_start,
  pay_period_end,
  pay_date,
  pay_frequency,
  status,
  total_hours,
  gross_amount,
  net_amount,
  taxes_amount,
  employees_count,
  processed_by,
  processed_at,
  created_at,
  updated_at
) VALUES (
  '16161616-1616-1616-1616-161616161616',
  '22222222-2222-2222-2222-222222222222',
  '88888888-8888-8888-8888-888888888881',
  DATE_TRUNC('month', CURRENT_DATE)::DATE,
  (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '27 days')::DATE,
  (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '30 days')::DATE,
  'monthly',
  'processed',
  328,
  4166.67,
  3300.00,
  866.67,
  2,
  '33333333-3333-3333-3333-333333333333',
  NOW() - INTERVAL '12 hours',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '12 hours'
)
ON CONFLICT (id) DO UPDATE
SET
  status = EXCLUDED.status,
  total_hours = EXCLUDED.total_hours,
  gross_amount = EXCLUDED.gross_amount,
  net_amount = EXCLUDED.net_amount,
  taxes_amount = EXCLUDED.taxes_amount,
  employees_count = EXCLUDED.employees_count,
  updated_at = NOW();

INSERT INTO paystubs (
  id,
  payroll_run_id,
  employee_id,
  pay_period_start,
  pay_period_end,
  pay_date,
  regular_hours,
  regular_rate,
  regular_pay,
  overtime_hours,
  overtime_rate,
  overtime_pay,
  bonus_pay,
  commission_pay,
  gross_pay,
  total_deductions,
  net_pay,
  ytd_gross_pay,
  ytd_deductions,
  ytd_net_pay,
  status,
  created_by,
  updated_by,
  created_at,
  updated_at
) VALUES
(
  '17171717-1717-1717-1717-171717171711',
  '16161616-1616-1616-1616-161616161616',
  '55555555-5555-5555-5555-555555555555',
  DATE_TRUNC('month', CURRENT_DATE)::DATE,
  (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '27 days')::DATE,
  (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '30 days')::DATE,
  160,
  13.54,
  2166.40,
  8,
  20.31,
  162.48,
  0,
  0,
  2328.88,
  488.88,
  1840.00,
  48900.00,
  10000.00,
  38900.00,
  'published',
  '33333333-3333-3333-3333-333333333333',
  '33333333-3333-3333-3333-333333333333',
  NOW() - INTERVAL '12 hours',
  NOW() - INTERVAL '12 hours'
),
(
  '17171717-1717-1717-1717-171717171712',
  '16161616-1616-1616-1616-161616161616',
  '66666666-6666-6666-6666-666666666666',
  DATE_TRUNC('month', CURRENT_DATE)::DATE,
  (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '27 days')::DATE,
  (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '30 days')::DATE,
  152,
  12.50,
  1900.00,
  0,
  18.75,
  0,
  0,
  0,
  1900.00,
  440.00,
  1460.00,
  43000.00,
  9400.00,
  33600.00,
  'published',
  '33333333-3333-3333-3333-333333333333',
  '33333333-3333-3333-3333-333333333333',
  NOW() - INTERVAL '12 hours',
  NOW() - INTERVAL '12 hours'
)
ON CONFLICT (id) DO UPDATE
SET
  gross_pay = EXCLUDED.gross_pay,
  total_deductions = EXCLUDED.total_deductions,
  net_pay = EXCLUDED.net_pay,
  status = EXCLUDED.status,
  updated_at = NOW();

INSERT INTO paystub_earnings (id, paystub_id, name, amount, created_at) VALUES
('18181818-1818-1818-1818-181818181811', '17171717-1717-1717-1717-171717171711', 'Regular Pay', 2166.40, NOW()),
('18181818-1818-1818-1818-181818181812', '17171717-1717-1717-1717-171717171711', 'Overtime Pay', 162.48, NOW()),
('18181818-1818-1818-1818-181818181813', '17171717-1717-1717-1717-171717171712', 'Regular Pay', 1900.00, NOW())
ON CONFLICT (id) DO UPDATE
SET amount = EXCLUDED.amount;

INSERT INTO paystub_deductions (id, paystub_id, name, amount, created_at) VALUES
('19191919-1919-1919-1919-191919191911', '17171717-1717-1717-1717-171717171711', 'Social Security', 256.18, NOW()),
('19191919-1919-1919-1919-191919191912', '17171717-1717-1717-1717-171717171711', 'Income Tax', 232.70, NOW()),
('19191919-1919-1919-1919-191919191913', '17171717-1717-1717-1717-171717171712', 'Social Security', 209.00, NOW()),
('19191919-1919-1919-1919-191919191914', '17171717-1717-1717-1717-171717171712', 'Income Tax', 231.00, NOW())
ON CONFLICT (id) DO UPDATE
SET amount = EXCLUDED.amount;

-- ============================================================================
-- Notificações
-- ============================================================================
INSERT INTO notifications (
  id,
  user_id,
  title,
  message,
  type,
  action_url,
  status,
  priority,
  created_at,
  updated_at,
  deleted_at
) VALUES
(
  '20202020-2020-2020-2020-202020202021',
  '55555555-5555-5555-5555-555555555555',
  'Paystub Published',
  'Your latest paystub is now available.',
  'payroll',
  '/dashboard/paystubs',
  'unread',
  'high',
  NOW() - INTERVAL '10 hours',
  NOW() - INTERVAL '10 hours',
  NULL
),
(
  '20202020-2020-2020-2020-202020202022',
  '66666666-6666-6666-6666-666666666666',
  'Leave Request Pending',
  'Your sick leave request is awaiting approval.',
  'leave',
  '/dashboard/my-leaves',
  'unread',
  'medium',
  NOW() - INTERVAL '5 hours',
  NOW() - INTERVAL '5 hours',
  NULL
),
(
  '20202020-2020-2020-2020-202020202023',
  '44444444-4444-4444-4444-444444444444',
  'Timesheet Needs Review',
  'Bruno Costa submitted a timesheet for approval.',
  'timesheet',
  '/dashboard/timesheets',
  'read',
  'medium',
  NOW() - INTERVAL '3 hours',
  NOW() - INTERVAL '2 hours',
  NULL
)
ON CONFLICT (id) DO UPDATE
SET
  status = EXCLUDED.status,
  priority = EXCLUDED.priority,
  updated_at = NOW();

COMMIT;

-- ============================================================================
-- Credenciais de teste
-- ============================================================================
-- admin@volta.local / Admin@123
-- hr@volta.local / Admin@123
-- ana.silva@volta.local / Admin@123
-- bruno.costa@volta.local / Admin@123
