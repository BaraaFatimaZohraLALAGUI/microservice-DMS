# Components Reference

## Document Components

### DocumentsList
Main component for displaying and managing documents.

```typescript
interface DocumentsListProps {
  initialParams?: DocumentListParams
  hideFilters?: boolean
}
```

**Features:**
- Grid/List view toggle
- Advanced filtering
- Sorting
- Pagination
- Bulk actions
- Favorites management

### DocumentDetails
Displays detailed information about a document.

```typescript
interface DocumentDetailsProps {
  documentId: string
}
```

**Features:**
- Document preview
- Metadata display
- Activity log
- Download/Edit/Delete actions
- Favorite toggle

### DocumentUploadForm
Handles document upload with metadata.

```typescript
interface DocumentUploadFormProps {
  folderId?: string
  onSuccess?: () => void
}
```

**Features:**
- Multi-file upload
- Drag and drop
- File type validation
- Progress tracking
- Metadata form

## Folder Components

### FoldersList
Displays folder hierarchy and management options.

```typescript
interface FoldersListProps {
  parentId?: string | null
}
```

**Features:**
- Hierarchical view
- Folder navigation
- Create/Edit/Delete actions
- Document count display

### FolderDetails
Shows folder contents and management options.

```typescript
interface FolderDetailsProps {
  folderId: string
}
```

**Features:**
- Folder metadata
- Subfolder list
- Document list
- Breadcrumb navigation
- Management actions

## UI Components

### Button
Standard button component with variants.

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  isLoading?: boolean
}
```

**Usage:**
```tsx
<Button variant="destructive" onClick={handleDelete}>
  Delete
</Button>
```

### Card
Container component for content sections.

```typescript
interface CardProps {
  className?: string
  children: React.ReactNode
}
```

**Usage:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Document Details</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

### Form Components

#### Input
Text input component with validation.

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
}
```

#### Select
Dropdown selection component.

```typescript
interface SelectProps {
  options: SelectOption[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
}
```

#### Checkbox
Checkbox input with label.

```typescript
interface CheckboxProps {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  label?: string
  disabled?: boolean
}
```

### Dialog
Modal dialog component.

```typescript
interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}
```

**Usage:**
```tsx
<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
    </DialogHeader>
    {/* Content */}
  </DialogContent>
</Dialog>
```

### Toast
Notification component.

```typescript
interface ToastProps {
  title?: string
  description?: string
  variant?: "default" | "success" | "error"
}
```

**Usage:**
```tsx
toast({
  title: "Success",
  description: "Document uploaded successfully",
  variant: "success"
})
```

## Layout Components

### Header
Main application header.

**Features:**
- Logo/branding
- Navigation menu
- User menu
- Search bar

### Sidebar
Navigation sidebar.

**Features:**
- Main navigation
- Quick actions
- Folder tree
- Collapse/expand

### Breadcrumb
Navigation breadcrumb.

```typescript
interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

interface BreadcrumbItem {
  label: string
  href?: string
}
```

## Utility Components

### FileIcon
Displays appropriate icon for file types.

```typescript
interface FileIconProps {
  type: string
  size?: "sm" | "md" | "lg"
}
```

### LoadingSpinner
Loading indicator component.

```typescript
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  color?: string
}
```

### ErrorBoundary
Error handling wrapper component.

```typescript
interface ErrorBoundaryProps {
  fallback?: React.ReactNode
  children: React.ReactNode
}
```

## Form Components

### DocumentForm
Base form for document operations.

```typescript
interface DocumentFormProps {
  initialData?: Partial<Document>
  onSubmit: (data: DocumentFormData) => Promise<void>
  isLoading?: boolean
}
```

### FolderForm
Form for folder creation/editing.

```typescript
interface FolderFormProps {
  folderId?: string
  onSuccess?: () => void
}
```

## Best Practices

### Component Organization
1. Group related components
2. Use index.ts for exports
3. Keep components focused
4. Implement proper prop types

### Styling
1. Use Tailwind utilities
2. Follow design system
3. Maintain consistency
4. Support dark mode

### Accessibility
1. Proper ARIA attributes
2. Keyboard navigation
3. Focus management
4. Screen reader support

### Performance
1. Lazy loading
2. Proper memoization
3. Optimized rerenders
4. Bundle size consideration