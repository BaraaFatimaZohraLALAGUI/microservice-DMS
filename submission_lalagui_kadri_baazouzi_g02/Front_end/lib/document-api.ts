import { v4 as uuidv4 } from "uuid"
import type { Document, Folder, DocumentListParams, DocumentListResponse, ActivityLog } from "./document-types"
import { getAuthHeader } from "./auth-service"

// Local Storage Keys
const DOCUMENTS_STORAGE_KEY = "dms_documents"
const FOLDERS_STORAGE_KEY = "dms_folders"
const ACTIVITIES_STORAGE_KEY = "dms_activities"
const FAVORITES_STORAGE_KEY = "dms_favorites"

// Helper to initialize local storage with sample data if empty
const initializeLocalStorage = () => {
  if (!localStorage.getItem(DOCUMENTS_STORAGE_KEY)) {
    const sampleDocuments: Document[] = generateSampleDocuments(25)
    localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(sampleDocuments))
  }

  if (!localStorage.getItem(FOLDERS_STORAGE_KEY)) {
    const sampleFolders: Folder[] = generateSampleFolders()
    localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(sampleFolders))
  }

  if (!localStorage.getItem(ACTIVITIES_STORAGE_KEY)) {
    const sampleActivities: ActivityLog[] = generateSampleActivities()
    localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(sampleActivities))
  }

  if (!localStorage.getItem(FAVORITES_STORAGE_KEY)) {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([]))
  }
}

// Generate sample documents for testing
const generateSampleDocuments = (count: number): Document[] => {
  const documents: Document[] = []
  const fileTypes = ["pdf", "docx", "xlsx", "pptx", "jpg", "png", "txt", "zip"]
  const categories = ["Reports", "Contracts", "Invoices", "Presentations", "Spreadsheets", "Images", "Other"]
  const tags = ["Important", "Urgent", "Draft", "Final", "Archived", "Confidential", "Public"]

  for (let i = 0; i < count; i++) {
    const type = fileTypes[Math.floor(Math.random() * fileTypes.length)]
    const category = categories[Math.floor(Math.random() * categories.length)]
    const randomTags = tags.filter(() => Math.random() > 0.7).slice(0, Math.floor(Math.random() * 3) + 1)

    const document: Document = {
      id: uuidv4(),
      name: `Sample Document ${i + 1}.${type}`,
      description: `This is a sample ${category.toLowerCase()} document for testing purposes.`,
      type,
      size: Math.floor(Math.random() * 10000000) + 100000, // Random size between 100KB and 10MB
      uploadDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000).toISOString(), // Random date within last 30 days
      uploader: {
        id: Math.floor(Math.random() * 10) + 1,
        name: `User ${Math.floor(Math.random() * 10) + 1}`,
      },
      tags: randomTags,
      category,
      privacy: Math.random() > 0.3 ? "public" : "private",
      folderId: Math.random() > 0.3 ? `folder-${Math.floor(Math.random() * 5) + 1}` : null,
      favorited: Math.random() > 0.8,
      url: `/placeholder.svg?height=300&width=300`,
    }

    documents.push(document)
  }

  return documents
}

// Generate sample folders
const generateSampleFolders = (): Folder[] => {
  return [
    {
      id: "folder-1",
      name: "Financial Documents",
      description: "All financial related documents",
      createdDate: new Date(Date.now() - 60 * 86400000).toISOString(),
      createdBy: { id: 1, name: "Admin User" },
      parentId: null,
    },
    {
      id: "folder-2",
      name: "HR Documents",
      description: "Human Resources documents",
      createdDate: new Date(Date.now() - 45 * 86400000).toISOString(),
      createdBy: { id: 1, name: "Admin User" },
      parentId: null,
    },
    {
      id: "folder-3",
      name: "Marketing Materials",
      description: "Marketing assets and documents",
      createdDate: new Date(Date.now() - 30 * 86400000).toISOString(),
      createdBy: { id: 2, name: "Marketing Manager" },
      parentId: null,
    },
    {
      id: "folder-4",
      name: "Project Plans",
      description: "Project planning documents",
      createdDate: new Date(Date.now() - 15 * 86400000).toISOString(),
      createdBy: { id: 3, name: "Project Manager" },
      parentId: null,
    },
    {
      id: "folder-5",
      name: "Technical Documentation",
      description: "Technical specifications and documentation",
      createdDate: new Date(Date.now() - 7 * 86400000).toISOString(),
      createdBy: { id: 4, name: "Technical Lead" },
      parentId: null,
    },
  ]
}

// Generate sample activity logs
const generateSampleActivities = (): ActivityLog[] => {
  const activities: ActivityLog[] = []
  const actions: ("upload" | "download" | "view" | "edit" | "delete")[] = [
    "upload",
    "download",
    "view",
    "edit",
    "delete",
  ]

  for (let i = 0; i < 50; i++) {
    activities.push({
      id: uuidv4(),
      documentId: `doc-${Math.floor(Math.random() * 25) + 1}`,
      userId: Math.floor(Math.random() * 10) + 1,
      userName: `User ${Math.floor(Math.random() * 10) + 1}`,
      action: actions[Math.floor(Math.random() * actions.length)],
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000).toISOString(),
    })
  }

  return activities
}

// API functions
export const getDocuments = async (params: DocumentListParams): Promise<DocumentListResponse> => {
  if (typeof window !== "undefined") {
    try {
      // Get auth header for API requests
      const headers = getAuthHeader();

      // Define the endpoint - if department filter is specified, use department-specific endpoint
      let endpoint = '/api/v1/documents';
      if (params.folderId) {
        // In our system, folderId is equivalent to departmentId on the backend
        endpoint = `/api/v1/documents/department/${params.folderId}`;
      }

      // Try the regular user endpoint first
      try {
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Fetched documents from API:', data);

          // If we get an empty page (user has no department assignments), 
          // try the admin endpoint to see all documents
          if (Array.isArray(data) && data.length === 0) {
            console.log('No documents found, trying admin endpoint');
            try {
              const adminResponse = await fetch('/api/v1/documents/all', {
                method: 'GET',
                headers: {
                  ...headers,
                  'Content-Type': 'application/json'
                }
              });

              if (adminResponse.ok) {
                const adminData = await adminResponse.json();
                console.log('Fetched documents from admin API:', adminData);

                // Process admin data
                if (Array.isArray(adminData) && adminData.length > 0) {
                  // Transform backend document format to frontend format
                  const documents = adminData.map(doc => ({
                    id: doc.id.toString(),
                    name: doc.titleEn || "",
                    description: doc.description || "",
                    type: getFileExtension(doc.s3FileKey || ""),
                    size: doc.fileSize || 0,
                    uploadDate: doc.createdAt || new Date().toISOString(),
                    uploader: {
                      id: 1,
                      name: doc.ownerUserId || "Unknown",
                    },
                    tags: [],
                    category: doc.categoryName || "Other",
                    privacy: "public",
                    folderId: doc.departmentId !== null && doc.departmentId !== undefined
                      ? doc.departmentId.toString()
                      : null,
                    favorited: false,
                    url: doc.s3FileKey || "",
                  }));

                  return {
                    documents,
                    pagination: {
                      totalDocuments: documents.length,
                      totalPages: 1,
                      currentPage: 1,
                      perPage: documents.length,
                      hasNext: false,
                      hasPrev: false,
                    },
                    sort: {
                      sortBy: "uploadDate",
                      order: "desc",
                    },
                  };
                }
              }
            } catch (adminError) {
              console.warn('Error fetching from admin endpoint:', adminError);
            }
          }

          // If we get an array of documents directly
          if (Array.isArray(data)) {
            // Transform backend document format to frontend format
            const documents = data.map(doc => ({
              id: doc.id.toString(),
              name: doc.titleEn || "",
              description: doc.description || "",
              type: getFileExtension(doc.s3FileKey || ""),
              size: doc.fileSize || 0,
              uploadDate: doc.createdAt || new Date().toISOString(),
              uploader: {
                id: 1,
                name: doc.ownerUserId || "Unknown",
              },
              tags: [],
              category: doc.categoryName || "Other",
              privacy: "public",
              // Important: Convert departmentId to string to match folder ID format
              folderId: doc.departmentId !== null && doc.departmentId !== undefined
                ? doc.departmentId.toString()
                : null,
              favorited: false,
              url: doc.s3FileKey || "",
            }));

            // REMOVING ALL PAGINATION - The backend doesn't support pagination
            // Just return documents in a simple structure
            return {
              documents,
              pagination: {
                totalDocuments: documents.length,
                totalPages: 1,
                currentPage: 1,
                perPage: documents.length,
                hasNext: false,
                hasPrev: false,
              },
              sort: {
                sortBy: "uploadDate",
                order: "desc",
              },
            };
          }

          // Return the data as-is if it's already in the expected format
          if (data && data.documents) {
            return data;
          }

          // If we got something else, try to wrap it in our expected format
          return {
            documents: Array.isArray(data) ? data : [],
            pagination: {
              totalDocuments: Array.isArray(data) ? data.length : 0,
              totalPages: 1,
              currentPage: 1,
              perPage: Array.isArray(data) ? data.length : 10,
              hasNext: false,
              hasPrev: false,
            },
            sort: {
              sortBy: "uploadDate",
              order: "desc",
            },
          };
        } else {
          console.warn('Failed to fetch documents from API, falling back to mock data');
          throw new Error('API request failed');
        }
      } catch (error) {
        console.warn('Error fetching documents:', error);
        // Fall back to mock data
      }
    } catch (error) {
      console.error('Error in getDocuments:', error);
    }

    // Fall back to mock data implementation
    // Initialize local storage if needed
    initializeLocalStorage();

    // Get documents from local storage
    const storedDocuments: Document[] = JSON.parse(localStorage.getItem(DOCUMENTS_STORAGE_KEY) || "[]");

    // No pagination or filtering - just return all documents
    return {
      documents: storedDocuments,
      pagination: {
        totalDocuments: storedDocuments.length,
        totalPages: 1,
        currentPage: 1,
        perPage: storedDocuments.length,
        hasNext: false,
        hasPrev: false,
      },
      sort: {
        sortBy: "uploadDate",
        order: "desc",
      },
    };
  }

  // Fallback for SSR
  return {
    documents: [],
    pagination: {
      totalDocuments: 0,
      totalPages: 1,
      currentPage: 1,
      perPage: 10,
      hasNext: false,
      hasPrev: false,
    },
    sort: {
      sortBy: "uploadDate",
      order: "desc",
    },
  };
}

export const getDocumentById = async (id: string): Promise<Document | null> => {
  if (typeof window !== "undefined") {
    try {
      // Get auth header for API requests
      const headers = getAuthHeader();

      try {
        const response = await fetch(`/api/v1/documents/${id}`, {
          method: 'GET',
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Fetched document from API:', data);

          // Return transformed document data to match frontend model
          return {
            id: data.id.toString(),
            name: data.titleEn || "",
            description: data.description || "",
            type: getFileExtension(data.s3FileKey || ""),
            size: data.fileSize || 0,
            uploadDate: data.createdAt || new Date().toISOString(),
            uploader: {
              id: 1,
              name: data.ownerUserId || "Unknown",
            },
            tags: data.tags || [],
            category: data.categoryName || "Other",
            privacy: "public",
            folderId: data.departmentId !== null && data.departmentId !== undefined
              ? data.departmentId.toString()
              : null,
            favorited: false,
            url: data.s3FileKey || "",
          };
        } else {
          console.warn('Failed to fetch document from API, falling back to mock data');
          throw new Error('API request failed');
        }
      } catch (error) {
        console.warn('Error fetching document:', error);
        // Fall back to mock data
      }
    } catch (error) {
      console.error('Error in getDocumentById:', error);
    }

    // Fall back to local storage implementation
    initializeLocalStorage()

    const storedDocuments: Document[] = JSON.parse(localStorage.getItem(DOCUMENTS_STORAGE_KEY) || "[]")
    const document = storedDocuments.find((doc) => doc.id === id)

    if (document) {
      // Log view activity
      logActivity(id, "view")
      return document
    }
  }

  return null
}

export const createDocument = async (document: {
  title: string;
  description: string;
  categoryId: number;
  departmentId: number | null;
  s3FileKey: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
}): Promise<Document> => {
  if (typeof window !== "undefined") {
    try {
      // Get auth header for API requests
      const headers = getAuthHeader();

      // Format document data according to backend DTO requirements
      const documentData = {
        titleEn: document.title,  // Change from title to titleEn
        categoryId: document.categoryId,
        departmentId: document.departmentId || 1, // Ensure we don't send null
        s3FileKey: document.s3FileKey,
        fileName: document.fileName || document.title + ".pdf",
        fileType: document.fileType || "application/pdf",
        fileSize: document.fileSize || 1000
      };

      try {
        console.log('Sending document data to API:', documentData);

        const response = await fetch('/api/v1/documents', {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(documentData)
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Created document via API:', data);

          // Return a document object formatted to match our frontend structure
          return {
            id: data.id.toString(),
            name: data.title || document.title,
            description: data.description || document.description || "",
            type: getFileExtension(document.s3FileKey),
            size: 0, // We don't get size from the API
            uploadDate: data.createdAt || new Date().toISOString(),
            uploader: {
              id: 1,
              name: data.createdBy || "Unknown",
            },
            tags: [],
            category: data.categoryName || "Other",
            privacy: "public",
            folderId: document.departmentId !== null && document.departmentId !== undefined
              ? document.departmentId.toString()
              : null,
            favorited: false,
            url: data.s3FileKey || document.s3FileKey,
          };
        } else {
          // Check if this might be a department access error
          if (response.status === 403) {
            console.error('Access denied: User does not have access to the selected department');
            throw new Error('You do not have permission to create documents in this department');
          } else {
            console.warn('Failed to create document via API, falling back to mock data');
            throw new Error('API request failed');
          }
        }
      } catch (error) {
        console.warn('Error creating document:', error);
        // Fall back to mock implementation
      }
    } catch (error) {
      console.error('Error in createDocument:', error);
    }

    // Initialize local storage if needed
    initializeLocalStorage();

    // Fallback to mock implementation
    const newDocument: Document = {
      id: uuidv4(),
      name: document.title,
      description: document.description,
      type: getFileExtension(document.s3FileKey),
      size: 0,
      uploadDate: new Date().toISOString(),
      uploader: {
        id: 1,
        name: "User",
      },
      tags: [],
      category: "Other",
      privacy: "public",
      folderId: document.departmentId !== null && document.departmentId !== undefined
        ? document.departmentId.toString()
        : null,
      favorited: false,
      url: document.s3FileKey,
    };

    // Get all documents and add the new one
    const storedDocuments: Document[] = JSON.parse(localStorage.getItem(DOCUMENTS_STORAGE_KEY) || "[]");
    storedDocuments.push(newDocument);
    localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(storedDocuments));

    // Log activity
    logActivity(newDocument.id, "upload");

    return newDocument;
  }

  throw new Error("Cannot create document in server-side environment");
};

export const updateDocument = async (id: string, updates: Partial<Document>): Promise<Document> => {
  if (typeof window !== "undefined") {
    initializeLocalStorage()

    const storedDocuments: Document[] = JSON.parse(localStorage.getItem(DOCUMENTS_STORAGE_KEY) || "[]")
    const documentIndex = storedDocuments.findIndex((doc) => doc.id === id)

    if (documentIndex !== -1) {
      const updatedDocument = {
        ...storedDocuments[documentIndex],
        ...updates,
      }

      storedDocuments[documentIndex] = updatedDocument
      localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(storedDocuments))

      // Log edit activity
      logActivity(id, "edit")

      return updatedDocument
    }
  }

  throw new Error("Document not found")
}

export const deleteDocument = async (id: string): Promise<void> => {
  if (typeof window !== "undefined") {
    initializeLocalStorage()

    const storedDocuments: Document[] = JSON.parse(localStorage.getItem(DOCUMENTS_STORAGE_KEY) || "[]")
    const updatedDocuments = storedDocuments.filter((doc) => doc.id !== id)

    localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(updatedDocuments))

    // Log delete activity
    logActivity(id, "delete")
  }
}

export const toggleFavorite = async (id: string): Promise<Document> => {
  if (typeof window !== "undefined") {
    initializeLocalStorage()

    const storedDocuments: Document[] = JSON.parse(localStorage.getItem(DOCUMENTS_STORAGE_KEY) || "[]")
    const documentIndex = storedDocuments.findIndex((doc) => doc.id === id)

    if (documentIndex !== -1) {
      const updatedDocument = {
        ...storedDocuments[documentIndex],
        favorited: !storedDocuments[documentIndex].favorited,
      }

      storedDocuments[documentIndex] = updatedDocument
      localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(storedDocuments))

      return updatedDocument
    }
  }

  throw new Error("Document not found")
}

export const downloadDocument = async (id: string): Promise<void> => {
  if (typeof window !== "undefined") {
    try {
      // First get the document to get the s3FileKey
      const document = await getDocumentById(id);

      if (!document) {
        throw new Error("Document not found");
      }

      // Get auth header for API requests
      const headers = getAuthHeader();

      // Request a presigned URL from the storage service
      try {
        // The s3FileKey might be in document.url
        const s3FileKey = document.url;

        if (!s3FileKey) {
          throw new Error("Document has no associated file");
        }

        const response = await fetch(`/api/storage/presigned-url/${encodeURIComponent(s3FileKey)}`, {
          method: 'GET',
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Got presigned URL:', data);

          if (data.url) {
            // Open the URL in a new tab or initiate download
            window.open(data.url, '_blank');

            // Log the download activity
            logActivity(id, "download");
            return;
          } else {
            throw new Error("No URL returned from storage service");
          }
        } else {
          console.warn('Failed to get presigned URL, falling back to mock data');
          throw new Error('API request failed');
        }
      } catch (error) {
        console.warn('Error getting presigned URL:', error);
        // Fall back to mock implementation
      }
    } catch (error) {
      console.error('Error in downloadDocument:', error);
    }

    // Fallback to local storage implementation when API fails
    initializeLocalStorage();

    const storedDocuments: Document[] = JSON.parse(localStorage.getItem(DOCUMENTS_STORAGE_KEY) || "[]");
    const document = storedDocuments.find((doc) => doc.id === id);

    if (document) {
      // Just log the activity when in fallback mode
      logActivity(id, "download");
      return;
    }
  }

  throw new Error("Document not found");
}

export const getFolders = async (): Promise<Folder[]> => {
  if (typeof window !== "undefined") {
    try {
      // Get auth header for API requests
      const headers = getAuthHeader();

      // Try to fetch from real API
      try {
        const response = await fetch('/api/departments', {
          method: 'GET',
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Fetched departments from API:', data);

          // Convert the backend department format to our frontend folder format
          // IMPORTANT: Keep the department ID as a string for consistency
          return data.map((dept: any) => ({
            id: dept.id.toString(), // Use string for frontend consistency
            name: dept.name,
            description: dept.description || `${dept.name} Department`,
            createdDate: dept.createdAt || new Date().toISOString(),
            createdBy: {
              id: 1,
              name: dept.createdBy || "Admin User"
            },
            parentId: null // Departments don't have parent-child relationships in the backend
          }));
        } else {
          console.warn('Failed to fetch departments from API, falling back to mock data');
          throw new Error('API request failed');
        }
      } catch (error) {
        console.warn('Error fetching departments:', error);
        // Fall back to mock data
      }
    } catch (error) {
      console.error('Error in getFolders:', error);
    }

    // Fallback to local storage
    initializeLocalStorage();
    return JSON.parse(localStorage.getItem(FOLDERS_STORAGE_KEY) || "[]");
  }
  return [];
}

export const getFolderById = async (id: string): Promise<Folder | null> => {
  if (typeof window !== "undefined") {
    initializeLocalStorage()

    const storedFolders: Folder[] = JSON.parse(localStorage.getItem(FOLDERS_STORAGE_KEY) || "[]")
    const folder = storedFolders.find((folder) => folder.id === id)

    return folder || null
  }

  return null
}

export const createFolder = async (folder: Omit<Folder, "id" | "createdDate">): Promise<Folder> => {
  if (typeof window !== "undefined") {
    initializeLocalStorage()

    const storedFolders: Folder[] = JSON.parse(localStorage.getItem(FOLDERS_STORAGE_KEY) || "[]")

    const newFolder: Folder = {
      ...folder,
      id: uuidv4(),
      createdDate: new Date().toISOString(),
    }

    storedFolders.push(newFolder)
    localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(storedFolders))

    return newFolder
  }

  throw new Error("Failed to create folder")
}

export const updateFolder = async (id: string, updates: Partial<Folder>): Promise<Folder> => {
  if (typeof window !== "undefined") {
    initializeLocalStorage()

    const storedFolders: Folder[] = JSON.parse(localStorage.getItem(FOLDERS_STORAGE_KEY) || "[]")
    const folderIndex = storedFolders.findIndex((folder) => folder.id === id)

    if (folderIndex !== -1) {
      const updatedFolder = {
        ...storedFolders[folderIndex],
        ...updates,
      }

      storedFolders[folderIndex] = updatedFolder
      localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(storedFolders))

      return updatedFolder
    }
  }

  throw new Error("Folder not found")
}

export const deleteFolder = async (id: string): Promise<void> => {
  if (typeof window !== "undefined") {
    initializeLocalStorage()

    // Get folders and documents
    const storedFolders: Folder[] = JSON.parse(localStorage.getItem(FOLDERS_STORAGE_KEY) || "[]")
    const storedDocuments: Document[] = JSON.parse(localStorage.getItem(DOCUMENTS_STORAGE_KEY) || "[]")

    // Remove the folder
    const updatedFolders = storedFolders.filter((folder) => folder.id !== id)

    // Update any documents in this folder to have no folder
    const updatedDocuments = storedDocuments.map((doc) => {
      if (doc.folderId === id) {
        return { ...doc, folderId: null }
      }
      return doc
    })

    // Save updates
    localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(updatedFolders))
    localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(updatedDocuments))
  }
}

export const getSubFolders = async (parentId: string | null): Promise<Folder[]> => {
  if (typeof window !== "undefined") {
    initializeLocalStorage()

    const storedFolders: Folder[] = JSON.parse(localStorage.getItem(FOLDERS_STORAGE_KEY) || "[]")
    return storedFolders.filter((folder) => folder.parentId === parentId)
  }

  return []
}

export const getDocumentsInFolder = async (folderId: string): Promise<Document[]> => {
  if (typeof window !== "undefined") {
    try {
      // Get auth header for API requests
      const headers = getAuthHeader();

      // Try to fetch all documents first, then filter by departmentId
      try {
        const response = await fetch('/api/documents', {
          method: 'GET',
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Filtering documents for departmentId/folderId:', folderId);

          // If we get an array of documents, filter by departmentId
          if (Array.isArray(data)) {
            // Transform and filter documents
            return data
              .filter(doc => {
                // Compare as strings for consistency
                const docDeptId = doc.departmentId !== null && doc.departmentId !== undefined
                  ? doc.departmentId.toString()
                  : null;
                return docDeptId === folderId;
              })
              .map(doc => ({
                id: doc.id.toString(),
                name: doc.title || "",
                description: doc.description || "",
                type: getFileExtension(doc.s3FileKey || ""),
                size: doc.fileSize || 0,
                uploadDate: doc.createdAt || new Date().toISOString(),
                uploader: {
                  id: 1,
                  name: doc.createdBy || "Unknown",
                },
                tags: [],
                category: doc.categoryName || "Other",
                privacy: "public",
                folderId: doc.departmentId ? doc.departmentId.toString() : null,
                favorited: false,
                url: doc.s3FileKey || "",
              }));
          }
        } else {
          console.warn('Failed to fetch documents from API, falling back to mock data');
          throw new Error('API request failed');
        }
      } catch (error) {
        console.warn('Error fetching documents in folder:', error);
        // Fall back to mock data
      }
    } catch (error) {
      console.error('Error in getDocumentsInFolder:', error);
    }

    // Fall back to local storage
    initializeLocalStorage();

    const storedDocuments: Document[] = JSON.parse(localStorage.getItem(DOCUMENTS_STORAGE_KEY) || "[]");
    return storedDocuments.filter((doc) => doc.folderId === folderId);
  }

  return [];
}

export const moveDocumentToFolder = async (documentId: string, folderId: string | null): Promise<Document> => {
  if (typeof window !== "undefined") {
    initializeLocalStorage()

    const storedDocuments: Document[] = JSON.parse(localStorage.getItem(DOCUMENTS_STORAGE_KEY) || "[]")
    const documentIndex = storedDocuments.findIndex((doc) => doc.id === documentId)

    if (documentIndex !== -1) {
      const updatedDocument = {
        ...storedDocuments[documentIndex],
        folderId,
      }

      storedDocuments[documentIndex] = updatedDocument
      localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(storedDocuments))

      return updatedDocument
    }
  }

  throw new Error("Document not found")
}

export const getDocumentActivities = async (documentId: string): Promise<ActivityLog[]> => {
  if (typeof window !== "undefined") {
    initializeLocalStorage()

    const storedActivities: ActivityLog[] = JSON.parse(localStorage.getItem(ACTIVITIES_STORAGE_KEY) || "[]")
    return storedActivities
      .filter((activity) => activity.documentId === documentId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  return []
}

// Helper function to log document activities
const logActivity = (documentId: string, action: "upload" | "download" | "view" | "edit" | "delete"): void => {
  if (typeof window !== "undefined") {
    const storedActivities: ActivityLog[] = JSON.parse(localStorage.getItem(ACTIVITIES_STORAGE_KEY) || "[]")

    const newActivity: ActivityLog = {
      id: uuidv4(),
      documentId,
      userId: 1, // Assuming current user has ID 1
      userName: "Admin User", // Assuming current user is Admin
      action,
      timestamp: new Date().toISOString(),
    }

    storedActivities.push(newActivity)
    localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(storedActivities))
  }
}

// Helper function to format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

// Helper function to get file extension from filename
export const getFileExtension = (filename: string): string => {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2).toLowerCase()
}

// Helper function to check if a file type supports preview
export const supportsPreview = (fileType: string): boolean => {
  const supportedTypes = ["pdf", "jpg", "jpeg", "png", "gif", "txt"]
  return supportedTypes.includes(fileType.toLowerCase())
}

// Helper function to map category name to ID (would come from real API in production)
const getCategoryId = (categoryName: string): number => {
  const categories: Record<string, number> = {
    "Reports": 1,
    "Contracts": 2,
    "Invoices": 3,
    "Presentations": 4,
    "Spreadsheets": 5,
    "Images": 6,
    "Other": 7
  };

  return categories[categoryName] || 1;
};

// Helper function to map folder ID to department ID (would come from real API in production)
const getDepartmentId = (folderId: string): number => {
  const departments: Record<string, number> = {
    "folder-1": 1, // Financial Documents -> Finance
    "folder-2": 2, // HR Documents -> HR
    "folder-3": 3, // Marketing Materials -> Marketing
    "folder-4": 4, // Project Plans -> Projects
    "folder-5": 5  // Technical Documentation -> Engineering
  };

  return departments[folderId] || 1;
};

// Upload file to storage service
export const uploadFile = async (file: File): Promise<{ s3FileKey: string }> => {
  if (typeof window !== "undefined") {
    try {
      // Get auth header for API requests
      const headers = getAuthHeader();

      // Create form data with file
      const formData = new FormData();
      formData.append('file', file);

      // Upload file to storage service
      const response = await fetch('/api/storage/upload/', {
        method: 'POST',
        headers: {
          ...headers,
          // Don't set Content-Type here as it will be set automatically for multipart/form-data
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        console.log('File uploaded successfully:', data);

        /* Expected response format from documentation:
        {
          "message": "File uploaded successfully to MinIO",
          "s3_key": "documents/abc123.pdf",
          "filename": "report.pdf",
          "content_type": "application/pdf",
          "size": 1024000
        }
        */

        if (data && data.s3_key) {
          return { s3FileKey: data.s3_key };
        } else {
          console.error('Invalid response format from storage service', data);
          throw new Error('Storage service returned an invalid response format');
        }
      } else {
        console.error('Failed to upload file:', await response.text());
        throw new Error('Failed to upload file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  throw new Error("Cannot upload file in server-side environment");
};

// Get categories from the backend API
export const getCategories = async (): Promise<{ id: number, name: string }[]> => {
  if (typeof window !== "undefined") {
    try {
      // Get auth header for API requests
      const headers = getAuthHeader();

      // Try to fetch from real API
      try {
        const response = await fetch('/api/categories', {
          method: 'GET',
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Fetched categories from API:', data);
          return data;
        } else {
          console.warn('Failed to fetch categories from API, falling back to mock data');
          throw new Error('API request failed');
        }
      } catch (error) {
        console.warn('Error fetching categories:', error);
        // Fall back to using hardcoded categories
      }
    } catch (error) {
      console.error('Error in getCategories:', error);
    }
  }

  // Fallback to hardcoded categories
  return DOCUMENT_CATEGORIES.map((name, index) => ({
    id: index + 1,
    name
  }));
}

