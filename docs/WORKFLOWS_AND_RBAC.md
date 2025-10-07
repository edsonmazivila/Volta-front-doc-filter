## Workflows and Role-Based Access Control (RBAC)

This document describes the main user workflows and the role-based permissions enforced by the NexuPayroll application. It is grounded in the current codebase (guards, middleware, and permission configuration).

### Roles

- Employee
- Operational Manager
- HR Manager
- Payroll Manager
- System Administrator

All managers and administrators are also employees; they inherit all Employee capabilities.

---

## Capabilities by Role

### Employee
- Timesheets
  - Create, edit, and submit own timesheets
  - View own timesheets
- Documents
  - Upload and view/download own documents
- Leave Requests
  - Create and view own leave requests (e.g., vacation)
- Meetings
  - Create/update/cancel own meetings; respond to invites
- Attendance
  - Check-in and check-out (attendance); submit own justifications

### Operational Manager (inherits Employee)
- Team Access
  - View department employees
  - View department timesheets; approve or reject department timesheets
  - View department documents; download department documents
  - View team leave requests; approve/reject leave requests
  - Attendance admin page access; export team attendance CSV; mark team absences
- Management
  - Manage departments (limited scope)
  - Company documents: view/download; approve/reject within scope (department/direct reports)
- Meetings
  - Manage meetings for self; may access team meetings where applicable

### Payroll Manager (inherits Employee)
- Company-wide Access for Payroll
  - View all employees (for payroll purposes)
  - View all timesheets; approve timesheets (company-wide)
  - View payroll dashboard and statistics; view payroll history
  - Calculate and run payroll; export payroll data and paystub registers
- Documents
  - View/download employee documents (payroll context)
  - Note: Document edit/approval is restricted primarily to HR/Admin; see Guards section for details

### HR Manager (inherits Employee)
- HR Administration
  - View/create/edit/delete employees (company-wide)
  - Manage departments
  - Manage users (create/update/delete)
  - View/generate/export reports
- Approvals
  - Approve/reject timesheets (company-wide)
  - Approve/reject leave requests (company-wide)
  - Full company and employee documents management (create/approve/delete)
- Attendance
  - Attendance admin page; export reports; mark absences

### System Administrator (inherits Employee)
- Full System Control
  - Company settings and profile (basic info)
  - Pay schedules
  - Leave policies
  - Departments and users management
  - Audit logs and system settings
  - All documents (create/approve/delete), payroll processing, reports

---

## Workflows by Area (Effective Permissions)

Below are highlights of the guarded endpoints and the effective permissions observed in the code.

### Timesheets
- Web pages: `GET /timesheets`, `GET /my-timesheets` (authenticated)
- API (guards via RBAC middleware):
  - List: `GET /api/timesheets` — own/department/all view
  - Create: `POST /api/timesheets` — edit own
  - Stats: `GET /api/timesheets/stats` — department/all view
  - Get: `GET /api/timesheets/:id` — own/department/all view
  - Update: `PUT /api/timesheets/:id` — edit own/all
  - Delete: `DELETE /api/timesheets/:id` — delete
  - Submit: `POST /api/timesheets/:id/submit` — submit own
  - Approve/Reject: `POST /api/timesheets/:id/approve|reject` — approve department/all

Effective roles (from default RBAC config and guards):
- Employee: view/edit/submit own
- Operational Manager: view/approve department; delete department (where permitted)
- HR Manager: view/edit/approve all
- Payroll Manager: view/approve all (needed for payroll)
- System Admin: full access

### Attendance
- Web pages: `GET /attendance/my` (employee), `GET /attendance/admin` (manager)
- Partials for UI: calendar, summary, team lists (auth; admin page requires manager)
- API:
  - `POST /api/attendance/check-in` — authenticated users
  - `POST /api/attendance/check-out` — authenticated users
  - `POST /api/attendance/mark-absence` — manager
  - `GET /api/attendance/report` — manager (CSV export)
  - `POST /api/attendance/justifications` — employees (own)
  - `POST /api/attendance/justifications/:id/approve|reject` — manager

### Leave Management
- Web pages: `GET /leaves` (employee), `GET /admin/leaves` (manager)
- API:
  - `POST /api/leave-requests` — create own
  - `GET /api/leave-requests/my` — view own
  - `GET /api/leave-requests` — list (scoped by role)
  - Approval: `POST /api/leave-requests/:id/approve|approve-l1|approve-final|reject` — manager
  - Balances: `GET /api/leave-balances/me` (own), team/company endpoints — manager
  - Policies: `GET/POST/PUT/DELETE /api/leave-policies` — manager (HR/Admin included)

### Payroll
- Web pages: `GET /payroll`, stats, history — guard requires ability to view team/company payroll (HR/Payroll/Admin)
- API (RBAC permissions):
  - Dashboard/Stats: `GET /api/payroll/dashboard|stats` — view all payroll or process payroll
  - Calculate/Run: `POST /api/payroll/calculate|run/:id` — process payroll
  - Reports/Exports: `GET /api/payroll/reports|excel/...` — export payroll data

Effective roles:
- Payroll Manager: full payroll processing and exports
- HR Manager: view payroll (team/company); exports where configured
- System Admin: full

### Documents (Employee & Company)
- Employee documents page: authenticated users (own documents)
- Company documents page: `GET /company-documents` — manager
- API:
  - Documents list/types/categories: require `documents:read`
  - Get/Download a document: guarded by document access middleware (owner, department, company, or admin)
  - Approve/Reject (employee docs):
    - HR/Admin: allowed universally
    - Operational Manager: allowed within scope (same department or direct reports)
  - Edit/Create/Delete:
    - System Admin / HR Manager: full
    - Payroll Manager: edit allowed by middleware; typically used for payroll-supporting docs
    - Operational Manager: view/download only (edit is denied)

### Company & Settings
- Company profile, departments: Require Manager (HR/Payroll/Operational Manager, and Admin)
- Users management API: Require User Management (HR/Admin)
- Pay schedules API: Require Manager
- RBAC configuration API: Admin only

---

## Summary Mapping

- Employee: can register own timesheets and documents, request leaves, create meetings, and register attendance (check in/out).
- Operational Manager: everything an employee can do, plus view/approve team timesheets and documents, manage team leave requests, access attendance admin, and manage departments.
- Payroll Manager: everything an employee can do, plus view all timesheets, approve timesheets, calculate and run payroll, and access payroll reports/exports.
- HR Manager: everything an employee can do, plus approve leave requests, manage company and employee documents, manage departments/users, and view/export reports.
- System Administrator: full control, including company documents, pay schedules, leave policies, company basic info, departments, users, audit logs, settings, payroll, and reports.


