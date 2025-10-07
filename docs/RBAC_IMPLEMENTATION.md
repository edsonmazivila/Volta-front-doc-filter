# RBAC Implementation Guide

## Overview

This document describes the Role-Based Access Control (RBAC) system implemented for the NEXUpayroll payroll system. The RBAC system provides granular permissions management with department-level access control and follows 2025 security best practices.

## Role Hierarchy

The system supports 5 distinct roles with hierarchical permissions:

### 1. Employee (Level 1)
- **Description**: Regular employee with access to own data only
- **Key Permissions**:
  - `employee:view:own` - View own employee data
  - `employee:edit:own` - Edit own employee data
  - `timesheet:view:own` - View own timesheets
  - `timesheet:edit:own` - Edit own timesheets
  - `timesheet:submit:own` - Submit own timesheets
  - `payroll:view:own` - View own paystubs

### 2. Operational Manager (Level 2)
- **Description**: Department manager with approval authority for timesheets and leave requests
- **Key Permissions**: All Employee permissions plus:
  - `employee:view:department` - View department employee data
  - `employee:edit:department` - Edit department employee data
  - `timesheet:view:department` - View department timesheets
  - `timesheet:approve:department` - Approve department timesheets
  - `reports:view:department` - View department reports

### 3. HR Manager (Level 3)
- **Description**: HR manager with administrative access to all employee data
- **Key Permissions**: All Employee permissions plus:
  - `employee:view:all` - View all employee data
  - `employee:edit:all` - Edit all employee data
  - `employee:create` - Create new employees
  - `employee:delete` - Delete employees
  - `timesheet:view:all` - View all timesheets
  - `timesheet:edit:all` - Edit all timesheets
  - `timesheet:approve:all` - Approve all timesheets
  - `departments:manage` - Manage departments
  - `users:manage` - Manage user accounts
  - `reports:view` - View reports
  - `reports:generate` - Generate reports

### 4. Payroll Manager (Level 3)
- **Description**: Payroll specialist with access to payroll processing and reporting
- **Key Permissions**: All Employee permissions plus:
  - `employee:view:all` - View all employees (needed for payroll)
  - `payroll:process` - Process payroll
  - `payroll:view:all` - View all payroll data
  - `payroll:generate` - Generate paystubs
  - `payroll:export` - Export payroll data
  - `timesheet:view:all` - View all timesheets (needed for payroll)
  - `timesheet:approve:all` - Approve all timesheets
  - `reports:view` - View reports
  - `reports:generate` - Generate reports

### 5. System Administrator (Level 5)
- **Description**: Full system administrator with complete access
- **Key Permissions**: All permissions from all roles plus:
  - `system:admin` - System administration
  - `company:manage` - Manage company settings
  - `settings:manage` - Manage system settings
  - `audit:view` - View audit logs

## Permission Format

Permissions follow a hierarchical format: `resource:action[:scope]`

- **resource**: The entity being accessed (employee, timesheet, payroll, etc.)
- **action**: The operation being performed (view, edit, create, delete, etc.)
- **scope**: Optional scope limiting the permission (own, department, all)

### Examples:
- `employee:view:own` - View own employee data
- `timesheet:approve:department` - Approve timesheets in own department
- `payroll:process` - Process payroll (no scope = global)

## Implementation Architecture

### Core Components

1. **RBAC Models** (`internal/models/rbac.go`)
   - Permission definitions
   - Role configurations
   - User context management

2. **RBAC Service** (`internal/auth/rbac_service.go`)
   - Permission checking logic
   - Department-level access control
   - User context creation

3. **RBAC Middleware** (`internal/middleware/rbac.go`)
   - HTTP middleware for permission checking
   - Resource-specific access control
   - Integration with Echo framework

4. **RBAC Handlers** (`internal/handlers/rbac_handlers.go`)
   - API endpoints for role management
   - Permission matrix generation
   - Configuration export (JSON/YAML)

## API Endpoints

### RBAC Management (Admin Only)

- `GET /api/rbac/roles` - Get all roles with permissions
- `GET /api/rbac/roles/:role/permissions` - Get permissions for specific role
- `GET /api/rbac/config.json` - Export role configuration as JSON
- `GET /api/rbac/permission-matrix` - Get permission matrix
- `GET /api/rbac/hierarchy` - Get role hierarchy

### User Permissions

- `GET /api/rbac/my-permissions` - Get current user's permissions

## Usage Examples

### 1. Basic Permission Check

```go
// Require specific permission
employees.GET("", h.ListEmployees, 
    rbacMiddleware.RequirePermission(models.PermissionViewAllEmployees))
```

### 2. Multiple Permission Check

```go
// Allow users with any of these permissions
employees.GET("", h.ListEmployees, 
    rbacMiddleware.RequireAnyPermission(
        models.PermissionViewAllEmployees,
        models.PermissionViewDepartmentEmployees,
    ))
```

### 3. Resource-Specific Access

```go
// Check access to specific employee
employees.GET("/:id", h.GetEmployee, 
    rbacMiddleware.RequireEmployeeAccess("id"))
```

### 4. Timesheet Approval

```go
// Check timesheet approval permissions
timesheets.POST("/:id/approve", h.ApproveTimesheet, 
    rbacMiddleware.RequireTimesheetApproval("employee_id"))
```

### 5. Business Logic Permission Check

```go
func (h *Handler) SomeBusinessLogic(c echo.Context) error {
    userContext, err := middleware.GetUserContextFromContext(c)
    if err != nil {
        return err
    }
    
    // Check specific permission
    if !userContext.HasPermission(models.PermissionViewAllEmployees) {
        return echo.NewHTTPError(http.StatusForbidden, "Insufficient permissions")
    }
    
    // Filter data based on permissions
    if userContext.HasPermission(models.PermissionViewAllEmployees) {
        // Return all data
    } else if userContext.HasPermission(models.PermissionViewDepartmentEmployees) {
        // Return department data only
    } else {
        // Return own data only
    }
}
```

## Migration from Legacy System

### Step 1: Update Middleware Usage

**Old:**
```go
employees.GET("", h.ListEmployees, authMiddleware.RequireManager)
```

**New:**
```go
employees.GET("", h.ListEmployees, 
    rbacMiddleware.RequirePermission(models.PermissionViewAllEmployees))
```

### Step 2: Update Context Helpers

**Old:**
```go
user, err := middleware.GetUserFromContext(c)
if user.IsAdmin() || user.IsManager() {
    // Do something
}
```

**New:**
```go
userContext, err := middleware.GetUserContextFromContext(c)
if userContext.HasPermission(models.PermissionViewAllEmployees) {
    // Do something
}
```

### Step 3: Replace Role Checks

**Old:**
```go
if user.Role == models.RoleAdmin || user.Role == models.RoleManager {
    // Business logic
}
```

**New:**
```go
if userContext.HasPermission(models.PermissionManageEmployees) {
    // Business logic
}
```

## Configuration

### JSON Configuration Example

```json
{
  "version": "1.0",
  "roles": {
    "employee": {
      "type": "employee",
      "name": "Employee",
      "description": "Regular employee with access to own data only",
      "level": 1,
      "permissions": [
        "employee:view:own",
        "employee:edit:own",
        "timesheet:view:own",
        "timesheet:edit:own",
        "timesheet:submit:own",
        "payroll:view:own"
      ]
    }
  }
}
```

### Debug Endpoints

- `GET /api/rbac/my-permissions` - View current user's permissions
- `GET /api/rbac/permission-matrix` - View complete permission matrix
- `GET /api/rbac/hierarchy` - View role hierarchy
