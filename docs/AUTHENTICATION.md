# Authentication and Session Management

This document describes the authentication and session management implementation in the JECH_Pay application.

## Overview

The application implements a **cookie-based authentication strategy** using HTTP-only cookies for all requests (both web pages and API calls).

This approach provides:
- **Security**: HTTP-only cookies prevent XSS attacks
- **Simplicity**: Single authentication mechanism
- **CSRF Protection**: SameSite cookie attribute prevents CSRF attacks
- **Automatic handling**: Browser automatically includes cookies in requests

## Authentication Flow

### Login Flow

1. User submits login form via Next.js Server Action
2. Server action calls backend API to validate credentials
3. Backend API sets HTTP-only, secure session cookie via `Set-Cookie` header
4. Server action reads session from response and sets it in Next.js cookies
5. User is redirected to dashboard
6. All subsequent requests automatically include the session cookie

## Session Strategy

### HTTP-only Cookies

- **Name**: `session_token`
- **HttpOnly**: `true` (prevents XSS attacks)
- **Secure**: `true` in production, `false` in development
- **SameSite**: `lax` (prevents CSRF attacks while allowing some cross-site navigation)
- **Path**: `/`
- **MaxAge**: 24 hours (86400 seconds)

### Optional Refresh Token

- **Name**: `refresh_token`
- **Same security settings as session token**
- **Used for token renewal without re-authentication**

## Implementation Details

### Frontend Architecture

#### Server Actions (`lib/auth/actions.ts`)

All authentication operations use Next.js Server Actions:

```typescript
export async function loginAction(prevState: unknown, formData: FormData) {
  // 1. Validate form data with Zod schema
  const validatedFields = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password')
  })
  
  // 2. Call backend API
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validatedFields.data),
    credentials: 'include' // Important: allows cookies
  })
  
  // 3. Extract session_id from response and set cookie
  const json = await res.json()
  const sessionId = json?.data?.session_id
  if (sessionId) {
    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAMES.SESSION_TOKEN, sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 // 24 hours
    })
  }
  
  return { success: true }
}
```

#### Middleware (`middleware.ts`)

Next.js middleware protects routes before they render:

```typescript
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Define public routes
  const isPublicRoute = publicRoutes.includes(pathname)
  const isAuthRoute = authRoutes.includes(pathname)
  
  // Get session token from cookies
  const sessionToken = request.cookies.get(COOKIE_NAMES.SESSION_TOKEN)?.value
  
  // Redirect authenticated users away from auth pages
  if (sessionToken && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  // Redirect unauthenticated users to login
  if (!sessionToken && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  return NextResponse.next()
}
```

#### Data Access Layer (`lib/auth/dal.ts`)

The DAL provides server-side session verification:

```typescript
export const verifySession = cache(async (): Promise<Session | null> => {
  // Get auth cookies and forward to backend
  const cookieHeader = await getAuthCookieHeader()
  if (!cookieHeader) return null

  const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookieHeader, // Forward cookies to backend
    },
    cache: 'no-store',
  })

  if (!res.ok) return null
  const data = await res.json()
  const user = data?.data?.user || data?.data || data?.user
  if (!user) return null
  return { user }
})

// Helper functions
export async function getUser(): Promise<User | null>
export async function requireUser(redirectTo = '/login'): Promise<User>
```

#### Cookie Forwarding Helper (`lib/auth/server-utils.ts`)

Centralized server-only helper for forwarding cookies to backend API:

```typescript
import 'server-only'

export async function getAuthCookieHeader(): Promise<string | undefined> {
  const cookieStore = await cookies()
  const session = cookieStore.get(COOKIE_NAMES.SESSION_TOKEN)?.value
  const refresh = cookieStore.get(COOKIE_NAMES.REFRESH_TOKEN)?.value
  
  const cookieHeader = [
    session ? `${COOKIE_NAMES.SESSION_TOKEN}=${session}` : null,
    refresh ? `${COOKIE_NAMES.REFRESH_TOKEN}=${refresh}` : null,
  ].filter(Boolean).join('; ')
  
  return cookieHeader || undefined
}
```

**Note**: This is a server-only utility and can only be used in Server Components, Server Actions, or Route Handlers.

### Logout Handler

API route clears cookies:

```typescript
// app/api/auth/logout/route.ts
export async function POST() {
  const cookieStore = await cookies()
  
  // Call backend logout
  await fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include'
  })
  
  // Clear session cookie
  cookieStore.set(COOKIE_NAMES.SESSION_TOKEN, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0 // Delete cookie
  })
  
  return NextResponse.json({ success: true })
}
```

## Frontend Integration

### React Components

#### Login Form

```typescript
// app/login/login-form.tsx
export function LoginForm() {
  const router = useRouter()
  
  return (
    <AuthForm
      title="Welcome back"
      onSubmit={async () => {}}
      action={async (formData) => {
        const result = await loginAction(undefined, formData)
        if ('success' in result) {
          router.push('/dashboard')
        }
      }}
      schema={loginSchema}
      submitText="Sign in"
    >
      <EmailField />
      <PasswordField />
    </AuthForm>
  )
}
```

#### Logout Button

```typescript
// components/dashboard/logout-button.tsx
export function LogoutButton() {
  const router = useRouter()
  
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }
  
  return <Button onClick={handleLogout}>Logout</Button>
}
```

### Session Context

Client-side session state is managed via React Context:

```typescript
// app/layout.tsx
export default async function RootLayout({ children }) {
  const user = await getUser() // Server-side
  const clientUser = user ? sanitizeUser(user) : null
  
  return (
    <SessionProvider initialUser={clientUser}>
      {children}
    </SessionProvider>
  )
}

// Usage in components
const { user, isAuthenticated } = useSession()
```

## Security Features

### Cookie Security

- **HttpOnly**: Prevents XSS access to session tokens
- **Secure**: Ensures HTTPS transmission in production
- **SameSite=lax**: Prevents CSRF attacks while allowing legitimate cross-site navigation
- **Path=/**: Scoped to entire application
- **MaxAge**: Automatic expiration after 24 hours

### Session Validation

- **Server-side verification**: Every request validates session with backend
- **Cached verification**: React cache prevents redundant API calls
- **Automatic expiration**: Sessions expire after configured duration
- **Refresh token support**: Optional refresh token for seamless renewal

### Environment Configuration

```bash
# Required
NEXT_PUBLIC_API_URL=http://localhost:8080

# Optional (defaults shown)
NODE_ENV=development  # 'production' enables secure cookies
```

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | Login (sets cookie) | No |
| POST | `/api/auth/register` | Signup | No |
| POST | `/api/auth/logout` | Logout (clears cookie) | Optional |
| POST | `/api/auth/forgot-password` | Request password reset | No |
| POST | `/api/auth/reset-password` | Reset password with token | No |
| GET | `/api/auth/profile` | Get user profile | Yes |

### Protected Routes

Routes are protected by Next.js middleware:

- **Public routes**: `/`, `/login`, `/signup`, `/forgot-password`, `/reset-password`
- **Auth routes**: Redirect to dashboard if authenticated
- **Protected routes**: All other routes require authentication

## Best Practices

### Development

1. **Use Server Actions**: All auth operations should use Next.js Server Actions
2. **Forward cookies**: Use `getAuthCookieHeader()` helper when calling backend APIs
3. **Cache session verification**: Use React `cache()` to prevent redundant API calls
4. **Validate on server**: Never trust client-side session state alone

### Security

1. **HTTPS in production**: Always use secure cookies in production
2. **SameSite cookies**: Prevents CSRF attacks
3. **HttpOnly cookies**: Prevents XSS attacks
4. **Short session lifetime**: 24-hour sessions with optional refresh tokens
5. **Server-side validation**: Every protected route validates session with backend

### Error Handling

1. **Graceful degradation**: Handle missing or invalid sessions gracefully
2. **Redirect to login**: Automatically redirect unauthenticated users
3. **Preserve redirect**: Save intended destination for post-login redirect
4. **Clear error messages**: Show user-friendly error messages

## Troubleshooting

### Common Issues

1. **Cookies not set**: 
   - Check `credentials: 'include'` in fetch requests
   - Verify backend sends `Set-Cookie` header
   - Ensure same domain or CORS configured properly

2. **Session not persisting**:
   - Check cookie `maxAge` is set correctly
   - Verify `httpOnly` and `secure` settings match environment
   - Check browser cookie settings

3. **Redirect loops**:
   - Verify middleware route configuration
   - Check that `/dashboard` is NOT in `publicRoutes`
   - Ensure session validation returns correct user data

4. **CORS errors**:
   - Backend must set `Access-Control-Allow-Credentials: true`
   - Frontend must use `credentials: 'include'`
   - Backend must allow specific origin (not `*` with credentials)

### Debug Tips

1. **Check cookies**: Browser DevTools → Application → Cookies
2. **Network inspection**: DevTools → Network → Check `Set-Cookie` headers
3. **Server logs**: Check backend API logs for authentication errors
4. **Middleware logs**: Add console.log in middleware to debug route protection

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│  ┌────────────┐    ┌──────────────┐    ┌────────────────┐  │
│  │ Login Form │───▶│ Server Action│───▶│ Set Cookie     │  │
│  └────────────┘    └──────────────┘    └────────────────┘  │
│                                                              │
│  ┌────────────┐    ┌──────────────┐    ┌────────────────┐  │
│  │ Protected  │───▶│  Middleware  │───▶│ Check Cookie   │  │
│  │   Route    │    │              │    │ Redirect if    │  │
│  └────────────┘    └──────────────┘    │ not auth       │  │
│                                         └────────────────┘  │
│                                                              │
│  ┌────────────┐    ┌──────────────┐    ┌────────────────┐  │
│  │  API Call  │───▶│ getAuthCookie│───▶│ Forward Cookie │  │
│  │ (Server)   │    │   Header()   │    │ to Backend     │  │
│  └────────────┘    └──────────────┘    └────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                  ┌──────────────────┐
                  │  Backend API     │
                  │  - Validate      │
                  │  - Return User   │
                  └──────────────────┘
```
