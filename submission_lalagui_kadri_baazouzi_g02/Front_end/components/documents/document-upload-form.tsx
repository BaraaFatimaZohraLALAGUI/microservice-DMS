"use client"

import React from "react"
import { JSX } from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  FileUpIcon,
  XIcon,
  FileIcon,
  FileTextIcon,
  FileSpreadsheetIcon,
  ImageIcon,
  ArchiveIcon,
  FileIcon as FilePresentation,
  Folder,
  FolderOpen
} from "lucide-react"
import { createDocument, formatFileSize, getFileExtension, getFolders, uploadFile, getCategories } from "@/lib/document-api"
import { DOCUMENT_CATEGORIES, DOCUMENT_TAGS, FILE_TYPES, Folder as FolderType } from "@/lib/document-types"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"

// Define the form schema
const documentFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  description: z.string().optional(),
  categoryId: z.string().min(1, { message: "Category is required" }),
  tags: z.array(z.string()).optional(),
  privacy: z.enum(["public", "private"]),
  folderId: z.string().nullable(),
})

type DocumentFormValues = z.infer<typeof documentFormSchema>

// Interface for categories from API
interface Category {
  id: number;
  name: string;
}

export default function DocumentUploadForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [folders, setFolders] = useState<FolderType[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingFolders, setLoadingFolders] = useState(true)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Get folderId from query params if present
  const folderIdFromUrl = searchParams?.get("folderId")

  // Initialize the form
  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      name: "",
      description: "",
      categoryId: "",
      tags: [],
      privacy: "public",
      folderId: folderIdFromUrl || null,
    },
  })

  // Load folders and categories on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load folders
        setLoadingFolders(true)
        const fetchedFolders = await getFolders()
        setFolders(fetchedFolders)
        setLoadingFolders(false)

        // Show warning if user has no department assignments
        if (fetchedFolders.length === 0) {
          setError("You don't have any department assignments. Please contact an administrator to get access to upload documents.")
        }

        // Load categories
        setLoadingCategories(true)
        const fetchedCategories = await getCategories()
        setCategories(fetchedCategories)
        setLoadingCategories(false)
      } catch (error) {
        console.error("Error loading data:", error)
        setLoadingFolders(false)
        setLoadingCategories(false)
      }
    }

    loadData()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setFiles((prev) => [...prev, ...newFiles])

      // If no name is set and we're adding the first file, use the file name
      if (!form.getValues("name") && files.length === 0 && newFiles.length === 1) {
        // Remove file extension for the document name
        const fileName = newFiles[0].name.replace(/\.[^/.]+$/, "")
        form.setValue("name", fileName)
      }
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: DocumentFormValues) => {
    if (files.length === 0) {
      setError("Please select at least one file to upload")
      return
    }

    // Make sure departmentId is a valid selection the user has access to
    if (data.folderId) {
      const selectedFolder = folders.find(f => f.id === data.folderId);
      if (!selectedFolder) {
        setError("The selected department doesn't exist or you don't have access to it")
        return;
      }
    }

    setUploading(true)
    setError(null)

    try {
      // Process each file
      for (const file of files) {
        try {
          // First upload the file to the storage service
          const { s3FileKey } = await uploadFile(file)
          console.log('File uploaded, s3FileKey:', s3FileKey)

          // Get file extension and convert to mime type
          const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
          const mimeTypes: Record<string, string> = {
            'pdf': 'application/pdf',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls': 'application/vnd.ms-excel',
            'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'ppt': 'application/vnd.ms-powerpoint',
            'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'txt': 'text/plain',
            'csv': 'text/csv',
          };
          const fileType = mimeTypes[fileExtension] || 'application/octet-stream';

          // Prepare the document data according to API specification
          const documentData = {
            title: files.length === 1 ? data.name : `${data.name} - ${file.name.replace(/\.[^/.]+$/, "")}`,
            description: data.description || "",
            categoryId: parseInt(data.categoryId), // Convert string to number
            departmentId: data.folderId ? parseInt(data.folderId) : null,
            s3FileKey: s3FileKey, // Use the s3FileKey returned from the upload
            // Add additional fields required by backend
            fileName: file.name,
            fileType: fileType,
            fileSize: file.size
          };

          console.log('Creating document with data:', documentData);

          // Create the document record through our API adapter
          await createDocument(documentData);

          // Note: The title translation happens automatically in the backend via Kafka
          // as mentioned in the documentation: "The Translation Service also listens to 
          // Kafka events when new documents are created and automatically translates their titles."
        } catch (err) {
          console.error(`Error processing file ${file.name}:`, err)
          setError(`Failed to process ${file.name}. Please try again.`)
          // Continue with other files
        }
      }

      // After uploading all files, just navigate to the documents page
      // The department/folder page navigation is removed as it's causing issues
      router.push("/documents")

    } catch (err) {
      console.error("Error uploading documents:", err)

      // Check if this is a department access error
      if (err instanceof Error && err.message.includes("permission") && err.message.includes("department")) {
        setError("You don't have permission to upload documents to the selected department. Please choose a different department.");
      } else {
        setError("Failed to upload documents. Please try again.");
      }
    } finally {
      setUploading(false)
    }
  }

  const getFileIcon = (file: File) => {
    const fileType = getFileExtension(file.name)
    const fileTypeInfo = FILE_TYPES[fileType as keyof typeof FILE_TYPES] || FILE_TYPES.default

    switch (fileTypeInfo.icon) {
      case "FileTextIcon":
        return <FileTextIcon className={`h-5 w-5 ${fileTypeInfo.color}`} />
      case "FileSpreadsheetIcon":
        return <FileSpreadsheetIcon className={`h-5 w-5 ${fileTypeInfo.color}`} />
      case "FilePresentation":
        return <FilePresentation className={`h-5 w-5 ${fileTypeInfo.color}`} />
      case "ImageIcon":
        return <ImageIcon className={`h-5 w-5 ${fileTypeInfo.color}`} />
      case "ArchiveIcon":
        return <ArchiveIcon className={`h-5 w-5 ${fileTypeInfo.color}`} />
      default:
        return <FileIcon className={`h-5 w-5 ${fileTypeInfo.color}`} />
    }
  }

  // Helper function to build a folder tree structure
  const buildFolderOptions = (folders: FolderType[], parentId: string | null = null, depth = 0): React.ReactElement[] => {
    const options: React.ReactElement[] = []

    // Get folders with the current parentId
    const relevantFolders = folders.filter(folder => folder.parentId === parentId)

    // Add each folder and its children recursively
    relevantFolders.forEach(folder => {
      options.push(
        <SelectItem key={folder.id} value={folder.id}>
          <div className="flex items-center">
            <FolderOpen className="mr-2 h-4 w-4" />
            <span>{'\u00A0'.repeat(depth * 2)}{folder.name}</span>
          </div>
        </SelectItem>
      )

      // Add children
      options.push(...buildFolderOptions(folders, folder.id, depth + 1))
    })

    return options
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column - Document details */}
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Document name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Document description" className="min-h-[120px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={loadingCategories}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={loadingCategories ? "Loading categories..." : "Select a category"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Document titles will be automatically translated to Spanish.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="folderId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Folder (Department)</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value === "null" ? null : value)}
                    value={field.value === null ? "null" : field.value}
                    disabled={loadingFolders}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={loadingFolders ? "Loading folders..." : "Select a folder"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="null">
                        <div className="flex items-center">
                          <Folder className="mr-2 h-4 w-4" />
                          <span>Root (No folder)</span>
                        </div>
                      </SelectItem>
                      {!loadingFolders && buildFolderOptions(folders)}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Documents can only be uploaded to departments you have access to.
                    Other users will only see documents from their assigned departments.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="privacy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Privacy</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select privacy level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="public">Public (All users)</SelectItem>
                      <SelectItem value="private">Private (Only you)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Right column - File upload */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Upload Files</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center text-center",
                    "hover:bg-muted/25 cursor-pointer transition-colors",
                    "group"
                  )}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FileUpIcon className="h-8 w-8 mb-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  <div className="mb-2 font-medium">
                    <span>Click to upload</span> or drag and drop
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">
                    PDF, Word, Excel, PowerPoint, images and more
                  </p>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    multiple
                    disabled={uploading}
                  />
                </div>

                {error && (
                  <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                    {error}
                  </div>
                )}

                {files.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium mb-3">Selected Files</h3>
                    <div className="space-y-2">
                      {files.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-md bg-background"
                        >
                          <div className="flex items-center space-x-3">
                            {getFileIcon(file)}
                            <div>
                              <div className="text-sm font-medium truncate max-w-[200px]">{file.name}</div>
                              <div className="text-xs text-muted-foreground">{formatFileSize(file.size)}</div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeFile(index)
                            }}
                            disabled={uploading}
                          >
                            <XIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <div className="text-xs text-muted-foreground">
                  Supported file types: PDF, DOCX, XLSX, PPTX, JPG, PNG, and more
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={() => router.back()} disabled={uploading}>
            Cancel
          </Button>
          <Button type="submit" disabled={uploading || loadingCategories || loadingFolders}>
            {uploading ? "Uploading..." : "Upload Document"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

