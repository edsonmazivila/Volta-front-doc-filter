# Next.js 15.5 Architecture Guide

## Recommended Pattern for CRUD Operations

### File Structure
```
lib/
  services/
    users.ts          # Server Actions (mutations) + cached reads
app/
  dashboard/
    users/
      page.tsx        # Server Component (data fetching)
components/
  users/
    user-management.tsx  # Client Component (UI + Server Actions)
```

### 1. Server-Side Service (lib/services/users.ts)

```typescript
'use server'
import { cache } from 'react'
import { revalidatePath, revalidateTag } from 'next/cache'
import { getAuthCookieHeader } from '@/lib/auth/server-utils'
import { API_BASE_URL } from '@/lib/config'

// READ (cached)
export const getUsers = cache(async () => {
  const cookieHeader = await getAuthCookieHeader()
  const res = await fetch(`${API_BASE_URL}/api/users`, {
    headers: { Cookie: cookieHeader || '' },
    next: { tags: ['users'], revalidate: 60 } // Cache for 60s
  })
  if (!res.ok) throw new Error('Failed to fetch users')
  return res.json()
})

// CREATE (Server Action)
export async function createUserAction(formData: FormData) {
  const parsed = userSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    // ... other fields
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const cookieHeader = await getAuthCookieHeader()
  const res = await fetch(`${API_BASE_URL}/api/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookieHeader || ''
    },
    body: JSON.stringify(parsed.data)
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    return { errors: { _form: [error.message || 'Failed to create user'] } }
  }

  revalidateTag('users')
  revalidatePath('/dashboard/users')
  return { success: true }
}

// UPDATE (Server Action)
export async function updateUserAction(id: string, formData: FormData) {
  // Similar to create...
  revalidateTag('users')
  revalidatePath('/dashboard/users')
  return { success: true }
}

// DELETE (Server Action)
export async function deleteUserAction(id: string) {
  const cookieHeader = await getAuthCookieHeader()
  const res = await fetch(`${API_BASE_URL}/api/users/${id}`, {
    method: 'DELETE',
    headers: { Cookie: cookieHeader || '' }
  })

  if (!res.ok) {
    throw new Error('Failed to delete user')
  }

  revalidateTag('users')
  revalidatePath('/dashboard/users')
  return { success: true }
}
```

### 2. Server Component Page (app/dashboard/users/page.tsx)

```typescript
import { getUsers } from '@/lib/services/users'
import { UserManagement } from '@/components/users/user-management'
import { requireUser } from '@/lib/auth/dal'

export default async function UsersPage() {
  await requireUser()
  const users = await getUsers() // Server-fetched, cached

  return (
    <div className='min-h-dvh flex app-background'>
      <Sidebar />
      <main className='flex-1'>
        <Header title='Users' />
        <section className='p-4'>
          <UserManagement users={users} />
        </section>
      </main>
    </div>
  )
}
```

### 3. Client Component (components/users/user-management.tsx)

```typescript
'use client'
import { useActionState } from 'react'
import { createUserAction, deleteUserAction } from '@/lib/services/users'
import { useToast } from '@/components/ui/toast'

interface Props {
  users: User[]
}

export function UserManagement({ users }: Props) {
  const { showToast } = useToast()
  const [createState, createAction, createPending] = useActionState(
    createUserAction,
    null
  )

  const handleDelete = async (id: string) => {
    try {
      await deleteUserAction(id)
      showToast({ type: 'success', message: 'User deleted' })
    } catch (error) {
      showToast({ type: 'error', message: 'Failed to delete user' })
    }
  }

  return (
    <div>
      {/* Create Form */}
      <form action={createAction}>
        <input name="name" placeholder="Name" required />
        <input name="email" type="email" placeholder="Email" required />

        <button type="submit" disabled={createPending}>
          {createPending ? 'Creating...' : 'Create User'}
        </button>

        {createState?.errors?._form && (
          <div className="text-red-600">{createState.errors._form[0]}</div>
        )}
      </form>

      {/* User List */}
      <div>
        {users.map(user => (
          <div key={user.id}>
            <span>{user.name}</span>
            <button onClick={() => handleDelete(user.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  )
}
```

## Key Principles

1. **Server Components = Data Fetching**
   - All reads happen in Server Components
   - Pass data as props to Client Components

2. **Server Actions = Mutations**
   - All creates/updates/deletes are Server Actions
   - Always call `revalidateTag()` and `revalidatePath()` after mutations

3. **Client Components = UI Only**
   - No direct API calls
   - Use `useActionState` for forms
   - Use Server Actions for mutations

4. **Caching Strategy**
   - Tag all fetches: `next: { tags: ['entity'] }`
   - Revalidate on mutations: `revalidateTag('entity')`
   - Use `cache()` wrapper to dedupe requests

5. **Error Handling**
   - Throw errors in server functions
   - Add error.tsx boundaries to pages
   - Show user-friendly messages with toast

## Migration Checklist

- [ ] Convert client services to Server Actions
- [ ] Add cache tags to all fetch calls
- [ ] Add revalidation to all mutations
- [ ] Remove `cache: 'no-store'`
- [ ] Remove client-side data fetching
- [ ] Use `useActionState` for forms
- [ ] Add error boundaries
- [ ] Fix environment variables
