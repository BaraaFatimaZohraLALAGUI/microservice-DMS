# State Management Guide

## Overview

The DMS uses a combination of React Context and local storage for state management, providing a balance between global state access and data persistence.

## Authentication State

### Auth Context
```typescript
// contexts/auth-context.tsx
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

### Usage Example
```typescript
function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth()
  
  return (
    {isAuthenticated ? (
      <UserDashboard user={user} onLogout={logout} />
    ) : (
      <LoginForm onSubmit={login} />
    )}
  )
}
```

## Document State Management

### Local Storage Structure
```typescript
interface StorageStructure {
  [DOCUMENTS_STORAGE_KEY]: Document[]
  [FOLDERS_STORAGE_KEY]: Folder[]
  [ACTIVITIES_STORAGE_KEY]: ActivityLog[]
  [FAVORITES_STORAGE_KEY]: string[] // Document IDs
}
```

### State Updates Flow
1. User Action → API Call
2. API Updates Local Storage
3. React State Updated
4. UI Re-renders

### Example State Update
```typescript
// Updating document metadata
async function updateDocument(id: string, updates: Partial<Document>) {
  // 1. Update local storage
  const documents = getStoredDocuments()
  const updatedDocs = documents.map(doc => 
    doc.id === id ? { ...doc, ...updates } : doc
  )
  setStoredDocuments(updatedDocs)

  // 2. Update React state
  setDocuments(updatedDocs)

  // 3. Log activity
  logActivity(id, "edit")
}
```

## Component-Level State

### Document List State
```typescript
interface DocumentListState {
  documents: Document[]
  loading: boolean
  error: string | null
  filters: DocumentFilters
  pagination: PaginationState
  sort: SortState
}
```

### Form State Management
```typescript
interface FormState {
  isSubmitting: boolean
  error: string | null
  success: boolean
}
```

### UI State Examples
```typescript
// Modal state
const [isOpen, setIsOpen] = useState(false)

// Loading state
const [loading, setLoading] = useState(false)

// Error state
const [error, setError] = useState<string | null>(null)
```

## State Management Patterns

### 1. Lifting State Up
When multiple components need the same state:
```typescript
function ParentComponent() {
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])
  
  return (
    <>
      <DocumentList
        onSelect={(id) => setSelectedDocuments([...selectedDocuments, id])}
      />
      <DocumentActions selectedIds={selectedDocuments} />
    </>
  )
}
```

### 2. State Composition
Breaking down complex state:
```typescript
function DocumentManager() {
  // Document state
  const [documents, setDocuments] = useState<Document[]>([])
  
  // UI state
  const [view, setView] = useState<"grid" | "list">("grid")
  
  // Filter state
  const [filters, setFilters] = useState<DocumentFilters>({})
  
  // Pagination state
  const [page, setPage] = useState(1)
}
```

### 3. State Updates with Optimistic UI
```typescript
async function toggleFavorite(documentId: string) {
  // Optimistic update
  setDocuments(docs => docs.map(doc =>
    doc.id === documentId
      ? { ...doc, favorited: !doc.favorited }
      : doc
  ))
  
  try {
    await api.toggleFavorite(documentId)
  } catch (error) {
    // Revert on error
    setDocuments(docs => docs.map(doc =>
      doc.id === documentId
        ? { ...doc, favorited: !doc.favorited }
        : doc
    ))
  }
}
```

## Performance Optimization

### 1. Memoization
```typescript
// Memoize expensive calculations
const sortedDocuments = useMemo(() => 
  documents.sort((a, b) => 
    sortOrder === "asc" 
      ? a[sortBy].localeCompare(b[sortBy])
      : b[sortBy].localeCompare(a[sortBy])
  ),
  [documents, sortBy, sortOrder]
)

// Memoize callbacks
const handleSort = useCallback((column: string) => {
  setSortBy(column)
  setSortOrder(current => current === "asc" ? "desc" : "asc")
}, [])
```

### 2. Context Splitting
Split context by domain to prevent unnecessary rerenders:
```typescript
// Document context
const DocumentContext = createContext<DocumentContextType>(null)
const FolderContext = createContext<FolderContext>(null)
const UIContext = createContext<UIContextType>(null)
```

### 3. Local State vs Context
Guidelines for state placement:
- Use local state for:
  - UI state (modals, loading)
  - Form state
  - Component-specific data
- Use context for:
  - Authentication
  - Theme
  - Shared document state
  - Global settings

## Error Handling

### 1. Error Boundaries
```typescript
class ErrorBoundary extends React.Component {
  state = { hasError: false }
  
  static getDerivedStateFromError(error) {
    return { hasError: true }
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />
    }
    return this.props.children
  }
}
```

### 2. Error State Management
```typescript
interface ErrorState {
  message: string
  code?: string
  field?: string
}

const [error, setError] = useState<ErrorState | null>(null)
```

## State Management Best Practices

1. **State Organization**
   - Keep state as close as needed
   - Split complex state
   - Use proper state initialization

2. **Performance**
   - Memoize when beneficial
   - Avoid unnecessary rerenders
   - Use proper dependencies

3. **Error Handling**
   - Implement error boundaries
   - Handle async errors
   - Show user-friendly messages

4. **State Updates**
   - Use immutable updates
   - Batch related changes
   - Consider optimistic updates