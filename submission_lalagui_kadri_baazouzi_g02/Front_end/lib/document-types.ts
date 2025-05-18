export interface Document {
  id: string
  name: string
  description: string
  type: string
  size: number
  uploadDate: string
  uploader: {
    id: number
    name: string
  }
  tags: string[]
  category: string
  privacy: "public" | "private"
  folderId: string | null
  favorited: boolean
  url: string // For local file URL or blob URL
}

export interface Folder {
  id: string
  name: string
  description: string
  createdDate: string
  createdBy: {
    id: number
    name: string
  }
  parentId: string | null
}

export interface DocumentListParams {
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

export interface DocumentListResponse {
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

export interface ActivityLog {
  id: string
  documentId: string
  userId: number
  userName: string
  action: "upload" | "download" | "view" | "edit" | "delete"
  timestamp: string
}

export const FILE_TYPES = {
  pdf: {
    icon: "FileTextIcon",
    color: "text-red-500",
    previewSupported: true,
  },
  doc: {
    icon: "FileTextIcon",
    color: "text-blue-500",
    previewSupported: false,
  },
  docx: {
    icon: "FileTextIcon",
    color: "text-blue-500",
    previewSupported: false,
  },
  xls: {
    icon: "FileSpreadsheetIcon",
    color: "text-green-500",
    previewSupported: false,
  },
  xlsx: {
    icon: "FileSpreadsheetIcon",
    color: "text-green-500",
    previewSupported: false,
  },
  ppt: {
    icon: "FilePresentation",
    color: "text-orange-500",
    previewSupported: false,
  },
  pptx: {
    icon: "FilePresentation",
    color: "text-orange-500",
    previewSupported: false,
  },
  txt: {
    icon: "FileTextIcon",
    color: "text-gray-500",
    previewSupported: true,
  },
  jpg: {
    icon: "ImageIcon",
    color: "text-purple-500",
    previewSupported: true,
  },
  jpeg: {
    icon: "ImageIcon",
    color: "text-purple-500",
    previewSupported: true,
  },
  png: {
    icon: "ImageIcon",
    color: "text-purple-500",
    previewSupported: true,
  },
  gif: {
    icon: "ImageIcon",
    color: "text-purple-500",
    previewSupported: true,
  },
  zip: {
    icon: "ArchiveIcon",
    color: "text-yellow-500",
    previewSupported: false,
  },
  rar: {
    icon: "ArchiveIcon",
    color: "text-yellow-500",
    previewSupported: false,
  },
  default: {
    icon: "FileIcon",
    color: "text-gray-500",
    previewSupported: false,
  },
}

export const DOCUMENT_CATEGORIES = [
  "Reports",
  "Contracts",
  "Invoices",
  "Presentations",
  "Spreadsheets",
  "Images",
  "Other",
]

export const DOCUMENT_TAGS = [
  "Important",
  "Urgent",
  "Draft",
  "Final",
  "Archived",
  "Confidential",
  "Public",
  "Marketing",
  "Finance",
  "HR",
  "Legal",
  "Technical",
]

