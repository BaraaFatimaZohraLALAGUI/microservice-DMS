# API Documentation

## Document API

### Document Operations

#### Get Documents
```typescript
async function getDocuments(params: DocumentListParams): Promise<DocumentListResponse>
```
Retrieves a list of documents with pagination and filtering support.

**Parameters:**
```typescript
interface DocumentListParams {
  page: number
  perPage: number
  sortBy: string
  order: "asc" | "desc"
  search?: string
  filters?: {
    type?: string[]
    tags?: string[]
    category?: string[]
    uploader?: number[]
    dateFrom?: string
    dateTo?: string
    folderId?: string
    favorites?: boolean
  }
}
```

**Response:**
```typescript
interface DocumentListResponse {
  documents: Document[]
  pagination: {
    totalDocuments: number
    totalPages: number
    currentPage: number
    perPage: number
    hasNext: boolean
    hasPrev: boolean
  }
  sort: {
    sortBy: string
    order: "asc" | "desc"
  }
}
```

#### Get Document by ID
```typescript
async function getDocumentById(id: string): Promise<Document | null>
```
Retrieves a single document by its ID.

#### Create Document
```typescript
async function createDocument(document: Omit<Document, "id" | "uploadDate">): Promise<Document>
```
Creates a new document in the system.

#### Update Document
```typescript
async function updateDocument(id: string, updates: Partial<Document>): Promise<Document>
```
Updates an existing document's metadata.

#### Delete Document
```typescript
async function deleteDocument(id: string): Promise<void>
```
Deletes a document from the system.

#### Toggle Favorite
```typescript
async function toggleFavorite(id: string): Promise<Document>
```
Toggles a document's favorite status.

### Folder Operations

#### Get Folders
```typescript
async function getFolders(): Promise<Folder[]>
```
Retrieves all folders in the system.

#### Get Folder by ID
```typescript
async function getFolderById(id: string): Promise<Folder | null>
```
Retrieves a single folder by its ID.

#### Create Folder
```typescript
async function createFolder(folder: Omit<Folder, "id" | "createdDate">): Promise<Folder>
```
Creates a new folder.

#### Update Folder
```typescript
async function updateFolder(id: string, updates: Partial<Folder>): Promise<Folder>
```
Updates an existing folder's details.

#### Delete Folder
```typescript
async function deleteFolder(id: string): Promise<void>
```
Deletes a folder and moves its documents to root.

### Activity Tracking

#### Get Document Activities
```typescript
async function getDocumentActivities(documentId: string): Promise<ActivityLog[]>
```
Retrieves activity logs for a specific document.

### Utility Functions

#### Format File Size
```typescript
function formatFileSize(bytes: number): string
```
Formats file size in bytes to human-readable format.

#### Get File Extension
```typescript
function getFileExtension(filename: string): string
```
Extracts file extension from filename.

#### Supports Preview
```typescript
function supportsPreview(fileType: string): boolean
```
Checks if a file type supports preview.

## Constants

### File Types
```typescript
const FILE_TYPES = {
  pdf: { icon: "FileTextIcon", color: "text-red-500", previewSupported: true },
  doc: { icon: "FileTextIcon", color: "text-blue-500", previewSupported: false },
  docx: { icon: "FileTextIcon", color: "text-blue-500", previewSupported: false },
  xls: { icon: "FileSpreadsheetIcon", color: "text-green-500", previewSupported: false },
  xlsx: { icon: "FileSpreadsheetIcon", color: "text-green-500", previewSupported: false },
  // ... more file types
}
```

### Document Categories
```typescript
const DOCUMENT_CATEGORIES = [
  "Reports",
  "Contracts",
  "Invoices",
  "Presentations",
  "Spreadsheets",
  "Images",
  "Other"
]
```

### Document Tags
```typescript
const DOCUMENT_TAGS = [
  "Important",
  "Urgent",
  "Draft",
  "Final",
  "Archived",
  "Confidential",
  "Public",
  // ... more tags
]
```

## Error Handling

All API functions may throw errors in the following cases:
- Network errors
- Invalid parameters
- Not found errors
- Permission errors

Example error handling:
```typescript
try {
  const document = await getDocumentById(id)
} catch (error) {
  console.error("Failed to fetch document:", error)
  // Handle error appropriately
}
```

## Best Practices

1. **Pagination**
   - Always use pagination for document lists
   - Keep page sizes reasonable (10-50 items)

2. **Error Handling**
   - Implement proper error handling
   - Show user-friendly error messages

3. **Activity Logging**
   - Log all important document operations
   - Include user context in logs

4. **Validation**
   - Validate input parameters
   - Check file types and sizes
   - Verify user permissions