# Authentication and Session Management

This document describes the authentication and session management implementation in the JECH_Pay application.

## Overview

The application implements a dual authentication strategy:

1. **HTTP-only Cookies** for web page sessions
2. **JWT tokens in localStorage** for API access

This approach provides security benefits while maintaining usability for both web and API clients.

## Authentication Flow

### Web Browser Authentication

1. User submits login form
2. Server validates credentials
3. Server sets HTTP-only, secure session cookie
4. Browser automatically includes cookie in subsequent requests
5. Server validates cookie on each request

### API Client Authentication

1. Client submits login request with `Content-Type: application/json`
2. Server validates credentials
3. Server returns JWT token pair (access + refresh tokens)
4. Client stores tokens in localStorage
5. Client includes `Authorization: Bearer <token>` header in API requests

## Session Strategy

### HTTP-only Cookies (Web Pages)

- **Name**: `session_token`
- **HttpOnly**: `true` (prevents XSS attacks)
- **Secure**: Configurable via `COOKIE_SECURE` environment variable
- **SameSite**: `Strict` (prevents CSRF attacks)
- **Path**: `/`
- **MaxAge**: 24 hours (86400 seconds)

### JWT Tokens (API)

- **Access Token**: 24 hours lifetime (configurable)
- **Refresh Token**: 7 days lifetime (configurable)
- **Storage**: localStorage for web APIs
- **Header**: `Authorization: Bearer <token>`

## Request Detection

The server automatically detects whether a request is from a web browser or API client using:

1. **Content-Type header**: `application/json` indicates API request
2. **Accept header**: Preference for JSON over HTML
3. **X-Requested-With header**: `XMLHttpRequest` indicates AJAX
4. **Authorization header**: Presence indicates API client
5. **User-Agent patterns**: Common API tools (Postman, curl, etc.)

## Implementation Details

### Login Handler

```go
func (ah *AuthHandlers) Login(c echo.Context) error {
    // ... authenticate user ...
    
    isAPIRequest := isAPIRequest(c)
    
    if isAPIRequest {
        // Return full token data for localStorage
        return c.JSON(http.StatusOK, SuccessResponse{
            Data: response, // Contains access_token, refresh_token
        })
    } else {
        // Set HTTP-only cookie for web
        cookie := &http.Cookie{
            Name:     "session_token",
            Value:    response.AccessToken,
            HttpOnly: true,
            Secure:   getEnv("COOKIE_SECURE", "true") == "true",
            SameSite: http.SameSiteStrictMode,
            Path:     "/",
            MaxAge:   86400, // 24 hours
        }
        c.SetCookie(cookie)
        
        return c.JSON(http.StatusOK, SuccessResponse{
            Message: "Login successful",
        })
    }
}
```

### Authentication Middleware

The middleware checks for authentication in this order:

1. **Session cookie** (`session_token`)
2. **Authorization header** (`Bearer <token>`)

```go
func (am *AuthMiddleware) RequireAuth(next echo.HandlerFunc) echo.HandlerFunc {
    return func(c echo.Context) error {
        // Check session cookie first
        sessionCookie, err := c.Cookie("session_token")
        if err == nil && sessionCookie.Value != "" {
            user, claims, err := am.authService.ValidateToken(sessionCookie.Value)
            if err == nil && claims.TokenType == "access" {
                // Set user in context and continue
                c.Set("user", user)
                return next(c)
            }
        }
        
        // Fallback to Authorization header
        authHeader := c.Request().Header.Get("Authorization")
        // ... validate Bearer token ...
    }
}
```

### Logout Handler

The logout handler clears both session cookies and returns success:

```go
func (ah *AuthHandlers) Logout(c echo.Context) error {
    // Clear session cookie
    cookie := &http.Cookie{
        Name:     "session_token",
        Value:    "",
        HttpOnly: true,
        Secure:   getEnv("COOKIE_SECURE", "true") == "true",
        SameSite: http.SameSiteStrictMode,
        Path:     "/",
        MaxAge:   -1, // Delete cookie
    }
    c.SetCookie(cookie)
    
    return c.JSON(http.StatusOK, SuccessResponse{
        Message: "Logged out successfully",
    })
}
```

## Frontend Integration

### JavaScript API Client

Use the provided `AuthManager` class for API interactions:

```javascript
// Login and store tokens
const loginResult = await authManager.login('user@example.com', 'password');

// Make authenticated API requests
const response = await authManager.makeRequest('/api/employees');

// Logout and clear tokens
await authManager.logout();
```

### Web Pages

For traditional web pages, authentication is handled automatically via cookies. No JavaScript required:

```html
<!-- Login form submits to /login -->
<form action="/login" method="POST">
    <input type="email" name="email" required>
    <input type="password" name="password" required>
    <button type="submit">Login</button>
</form>
```

## Security Features

### Cookie Security

- **HttpOnly**: Prevents XSS access to tokens
- **Secure**: Ensures HTTPS transmission (configurable)
- **SameSite=Strict**: Prevents CSRF attacks
- **Path=/**: Scoped to entire application

### JWT Security

- **HS256 signing**: Cryptographic token integrity
- **Token expiration**: Automatic token invalidation
- **Refresh tokens**: Secure token renewal
- **User validation**: Token-user binding verification

### Environment Configuration

```bash
# Development (HTTP)
COOKIE_SECURE=false

# Production (HTTPS)
COOKIE_SECURE=true
```

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | API login (returns tokens) | No |
| POST | `/login` | Web login (sets cookie) | No |
| POST | `/api/auth/logout` | Logout (clears tokens) | Optional |
| POST | `/logout` | Web logout (clears cookie) | Optional |
| POST | `/api/auth/refresh` | Refresh access token | No |
| GET | `/api/auth/profile` | Get user profile | Yes |

### Middleware Types

1. **RequireAuth**: Strict authentication required
2. **OptionalAuth**: Extract user if authenticated
3. **RequireWebAuth**: Web-specific auth with login redirect
4. **RequireRole**: Role-based access control

## Best Practices

### For Web Applications

1. Use form-based login for traditional web pages
2. Let cookies handle authentication automatically
3. Implement proper CSRF protection
4. Use HTTPS in production

### For API Clients

1. Store tokens securely in localStorage
2. Include `Content-Type: application/json` header
3. Handle token refresh automatically
4. Clear tokens on logout

### For Mobile Apps

1. Use secure storage for tokens (Keychain/Keystore)
2. Implement biometric authentication where possible
3. Use certificate pinning for API communications
4. Handle background token refresh

## Troubleshooting

### Common Issues

1. **Cookies not working**: Check `COOKIE_SECURE` setting matches protocol (HTTP/HTTPS)
2. **CORS issues**: Ensure `Access-Control-Allow-Credentials: true` for cookie requests
3. **Token expiration**: Implement refresh token flow
4. **Mixed authentication**: Ensure consistent API vs web request patterns

### Debug Tips

1. Check browser Developer Tools → Application → Cookies
2. Verify Authorization headers in Network tab
3. Enable debug logging: `LOG_LEVEL=debug`
4. Test with curl or Postman for API endpoints

## Migration Notes

When upgrading from previous versions:

1. Update client applications to handle new authentication flow
2. Configure `COOKIE_SECURE` environment variable
3. Update frontend JavaScript to use new AuthManager
4. Test both web and API authentication flows
