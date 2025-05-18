# Authentication & Authorization Guide

## Authentication System

### Overview
The DMS uses a JWT (JSON Web Token) based authentication system with the following features:
- Token-based authentication
- Secure password handling
- Persistent login with refresh tokens
- Role-based access control

### Authentication Context
The application uses React's Context API for global authentication state:

```typescript
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  signup: (data: SignupData) => Promise<void>
  logout: () => void
  isAdmin: boolean
}
```

### Token Management

#### Storage
- Access token stored in memory
- Refresh token in HTTP-only cookie
- Token expiration: 7 days

#### Token Flow
1. User logs in → Receives access & refresh tokens
2. Access token used for API requests
3. Token expires → Refresh token used to get new access token
4. Logout → Both tokens invalidated

## Authorization

### User Roles

1. **Admin**
   - Full system access
   - User management
   - System configuration
   - Activity log access

2. **Regular User**
   - Document management
   - Personal folder creation
   - Limited sharing capabilities

### Permission System

#### Document Permissions
```typescript
type DocumentPermission = 
  | "view"
  | "edit"
  | "delete"
  | "share"
  | "download"
```

#### Folder Permissions
```typescript
type FolderPermission = 
  | "view"
  | "edit"
  | "delete"
  | "create"
  | "manage"
```

### Access Control Matrix

| Action                  | Admin | Regular User |
|------------------------|-------|--------------|
| View Documents         | ✅    | ✅           |
| Create Documents       | ✅    | ✅           |
| Delete Documents       | ✅    | Own only     |
| Manage Users          | ✅    | ❌           |
| Create Root Folders    | ✅    | ✅           |
| Delete Any Folder      | ✅    | Own only     |
| View Activity Logs     | ✅    | Own only     |
| System Configuration   | ✅    | ❌           |

## Implementation Guide

### Protected Routes
```typescript
// Example of a protected route
export default function ProtectedPage() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!isAuthenticated) {
    redirect("/login")
  }

  return <YourComponent />
}
```

### Role Guard Component
```typescript
interface RoleGuardProps {
  children: React.ReactNode
  requiredRole: "admin" | "user"
}

export function RoleGuard({ children, requiredRole }: RoleGuardProps) {
  const { user, isAdmin } = useAuth()
  
  if (requiredRole === "admin" && !isAdmin) {
    return <AccessDenied />
  }
  
  return <>{children}</>
}
```

### API Authentication

#### Request Headers
```typescript
const headers = {
  "Authorization": `Bearer ${accessToken}`,
  "Content-Type": "application/json"
}
```

#### Protected API Route
```typescript
export async function GET(req: Request) {
  const session = await getServerSession()
  
  if (!session) {
    return new Response("Unauthorized", { status: 401 })
  }
  
  // Continue with protected logic
}
```

## Security Best Practices

### Password Security
1. **Hashing**
   - Use bcrypt for password hashing
   - Salt rounds: 12 (configurable)
   - Never store plain passwords

2. **Password Requirements**
   - Minimum 8 characters
   - At least one uppercase
   - At least one number
   - At least one special character

### Session Security
1. **Token Configuration**
   - Short-lived access tokens (15 minutes)
   - Secure, HTTP-only cookies
   - CSRF protection
   - Same-site cookie policy

2. **Security Headers**
   - CORS configuration
   - Content Security Policy
   - XSS protection
   - Frame options

### Error Handling
1. **Authentication Errors**
   - Invalid credentials
   - Expired tokens
   - Missing permissions

2. **Security Responses**
   - Generic error messages
   - No sensitive data in responses
   - Proper status codes

## Testing Authentication

### Unit Tests
```typescript
describe("Authentication", () => {
  test("should login successfully with valid credentials", async () => {
    // Test implementation
  })
  
  test("should handle invalid credentials", async () => {
    // Test implementation
  })
})
```

### Integration Tests
```typescript
describe("Protected Routes", () => {
  test("should redirect unauthenticated users", async () => {
    // Test implementation
  })
  
  test("should allow authenticated users", async () => {
    // Test implementation
  })
})
```

## Troubleshooting

### Common Issues
1. **Token Expiration**
   - Check token validity
   - Implement refresh token rotation
   - Handle expired sessions

2. **Permission Denied**
   - Verify user roles
   - Check resource ownership
   - Review access control rules

3. **Session Issues**
   - Clear browser cache/cookies
   - Check token storage
   - Verify CORS settings