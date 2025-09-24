# RBAC Implementation Guide

## Overview

This document describes the Role-Based Access Control (RBAC) system implemented for the JECH Pay payroll system. The RBAC system provides granular permissions management with department-level access control and follows 2025 security best practices.

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

### JWT Integration

The system enhances JWT tokens with additional claims:

```go
type Claims struct {
    UserID       uuid.UUID            `json:"user_id"`
    Email        string               `json:"email"`
    Role         models.UserRole      `json:"role"`         // Legacy role
    RoleType     models.RoleType      `json:"role_type"`    // New role type
    CompanyID    *uuid.UUID           `json:"company_id,omitempty"`
    DepartmentID *uuid.UUID           `json:"department_id,omitempty"`
    EmployeeID   *uuid.UUID           `json:"employee_id,omitempty"`
    ManagerID    *uuid.UUID           `json:"manager_id,omitempty"`
    Permissions  []models.Permission  `json:"permissions"`
    TokenType    string               `json:"token_type"`
    jwt.RegisteredClaims
}
```

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

### Environment Variables

- `JWT_SECRET_KEY` - JWT signing secret
- `JWT_ACCESS_TTL_HOURS` - Access token TTL (default: 24)
- `JWT_REFRESH_TTL_DAYS` - Refresh token TTL (default: 7)

## Security Considerations

1. **Principle of Least Privilege**: Users are granted only the minimum permissions needed
2. **Department Isolation**: Operational managers can only access their department's data
3. **Audit Trail**: All permission checks are logged for security auditing
4. **Token Security**: JWT tokens include permission claims to reduce database queries
5. **Resource-Level Access**: Fine-grained control over individual resources

## Testing

### Unit Tests

Test files are located in `internal/auth/*_test.go` and include:
- Permission checking logic
- Role hierarchy validation
- Department-level access control
- JWT claim validation

### Integration Tests

API tests verify:
- Endpoint access control
- Permission enforcement
- Error handling
- Resource isolation

## Performance Considerations

1. **JWT Claims**: Permissions are embedded in JWT tokens to reduce database queries
2. **Caching**: Role configurations are cached in memory
3. **Lazy Loading**: Employee context is loaded only when needed
4. **Efficient Queries**: Database queries are optimized for permission checking

## Monitoring and Observability

1. **Access Logs**: All permission checks are logged
2. **Metrics**: Permission denial rates and access patterns
3. **Alerts**: Suspicious access attempts or privilege escalation
4. **Audit Trail**: Complete audit log of permission changes

## Future Enhancements

1. **Dynamic Permissions**: Runtime permission assignment
2. **Resource-Based Permissions**: Object-level access control
3. **Temporary Permissions**: Time-limited access grants
4. **Permission Inheritance**: Hierarchical permission inheritance
5. **External Identity Providers**: SAML/OAuth2 integration

## Troubleshooting

### Common Issues

1. **Permission Denied**: Check user's role and permissions in JWT token
2. **Department Access**: Verify employee's department assignment
3. **Token Expiry**: Ensure access tokens are refreshed properly
4. **Role Migration**: Verify legacy roles are properly converted

### Debug Endpoints

- `GET /api/rbac/my-permissions` - View current user's permissions
- `GET /api/rbac/permission-matrix` - View complete permission matrix
- `GET /api/rbac/hierarchy` - View role hierarchy

## Support

For questions or issues with the RBAC implementation:

1. Check this documentation
2. Review the permission matrix at `/api/rbac/permission-matrix`
3. Verify user permissions at `/api/rbac/my-permissions`
4. Contact the development team with specific error messages and user context 