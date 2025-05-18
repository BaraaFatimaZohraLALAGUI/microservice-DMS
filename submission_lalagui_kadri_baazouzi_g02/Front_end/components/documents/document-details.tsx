"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  TrashIcon,
  DownloadIcon,
  StarIcon,
  FileTextIcon,
  FileIcon,
  FileSpreadsheetIcon,
  ImageIcon,
  ArchiveIcon,
  FileIcon as FilePresentation,
  ClockIcon,
  UserIcon,
  TagIcon,
  FolderIcon,
} from "lucide-react"
import {
  getDocumentById,
  getDocumentActivities,
  deleteDocument,
  downloadDocument,
  toggleFavorite,
  formatFileSize,
} from "@/lib/document-api"
import { type Document, type ActivityLog, FILE_TYPES } from "@/lib/document-types"
import { format } from "date-fns"

interface DocumentDetailsProps {
  documentId: string
}

export default function DocumentDetails({ documentId }: DocumentDetailsProps) {
  const router = useRouter()
  const [document, setDocument] = useState<Document | null>(null)
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDocumentDetails = async () => {
      try {
        const documentData = await getDocumentById(documentId)
        if (documentData) {
          setDocument(documentData)

          // Fetch activities
          const activitiesData = await getDocumentActivities(documentId)
          setActivities(activitiesData)
        } else {
          setError("Document not found")
        }
      } catch (err) {
        setError("Failed to load document details")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchDocumentDetails()
  }, [documentId])

  const handleDelete = async () => {
    try {
      await deleteDocument(documentId)
      router.push("/documents")
    } catch (err) {
      setError("Failed to delete document")
      console.error(err)
    }
  }

  const handleDownload = async () => {
    try {
      await downloadDocument(documentId)
      // In a real app, this would trigger a file download
      alert("Download started (simulated)")
    } catch (err) {
      setError("Failed to download document")
      console.error(err)
    }
  }

  const handleToggleFavorite = async () => {
    if (!document) return

    try {
      const updatedDocument = await toggleFavorite(documentId)
      setDocument(updatedDocument)
    } catch (err) {
      setError("Failed to update favorite status")
      console.error(err)
    }
  }

  if (loading) {
    return <div>Loading document details...</div>
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  if (!document) {
    return <div>Document not found</div>
  }

  const getFileIcon = (type: string) => {
    const fileType = FILE_TYPES[type as keyof typeof FILE_TYPES] || FILE_TYPES.default

    switch (fileType.icon) {
      case "FileTextIcon":
        return <FileTextIcon className={`h-6 w-6 ${fileType.color}`} />
      case "FileSpreadsheetIcon":
        return <FileSpreadsheetIcon className={`h-6 w-6 ${fileType.color}`} />
      case "FilePresentation":
        return <FilePresentation className={`h-6 w-6 ${fileType.color}`} />
      case "ImageIcon":
        return <ImageIcon className={`h-6 w-6 ${fileType.color}`} />
      case "ArchiveIcon":
        return <ArchiveIcon className={`h-6 w-6 ${fileType.color}`} />
      default:
        return <FileIcon className={`h-6 w-6 ${fileType.color}`} />
    }
  }

  const supportsPreview = () => {
    const fileType = document.type.toLowerCase()
    return ["jpg", "jpeg", "png", "gif", "pdf", "txt"].includes(fileType)
  }

  const renderPreview = () => {
    const fileType = document.type.toLowerCase()

    if (["jpg", "jpeg", "png", "gif"].includes(fileType)) {
      return (
        <div className="flex justify-center">
          <div className="relative max-w-full max-h-[500px] overflow-hidden rounded-md">
            <Image
              src={document.url || "/placeholder.svg"}
              alt={document.name}
              width={800}
              height={600}
              className="object-contain"
            />
          </div>
        </div>
      )
    } else if (fileType === "pdf") {
      return (
        <div className="flex justify-center">
          <div className="bg-muted rounded-md p-8 text-center">
            <FileTextIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <p>PDF preview is not available in this demo.</p>
            <p className="text-sm text-muted-foreground mt-2">
              In a real application, a PDF viewer would be integrated here.
            </p>
            <Button className="mt-4" onClick={handleDownload}>
              <DownloadIcon className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </div>
      )
    } else if (fileType === "txt") {
      return (
        <div className="bg-muted rounded-md p-6">
          <p>Text file preview is not available in this demo.</p>
          <p className="text-sm text-muted-foreground mt-2">
            In a real application, the text content would be displayed here.
          </p>
        </div>
      )
    } else {
      return (
        <div className="bg-muted rounded-md p-8 text-center">
          <div className="flex justify-center mb-4">{getFileIcon(document.type)}</div>
          <p>Preview not available for this file type.</p>
          <Button className="mt-4" onClick={handleDownload}>
            <DownloadIcon className="mr-2 h-4 w-4" />
            Download File
          </Button>
        </div>
      )
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex h-12 w-12 items-center justify-center rounded bg-muted">
              {getFileIcon(document.type)}
            </div>
            <CardTitle className="text-xl">{document.name}</CardTitle>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleToggleFavorite}
              className={document.favorited ? "text-yellow-500" : ""}
            >
              <StarIcon className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={handleDownload}>
              <DownloadIcon className="mr-2 h-4 w-4" />
              Download
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon">
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the document and all associated data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
            <p>{document.description}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                <FileIcon className="mr-2 h-4 w-4" />
                File Details
              </h3>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm">Type:</span>
                  <span className="text-sm font-medium">{document.type.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Size:</span>
                  <span className="text-sm font-medium">{formatFileSize(document.size)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Privacy:</span>
                  <span className="text-sm font-medium capitalize">{document.privacy}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                <ClockIcon className="mr-2 h-4 w-4" />
                Upload Information
              </h3>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm">Date:</span>
                  <span className="text-sm font-medium">{format(new Date(document.uploadDate), "PPP")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Time:</span>
                  <span className="text-sm font-medium">{format(new Date(document.uploadDate), "p")}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                <UserIcon className="mr-2 h-4 w-4" />
                Uploader
              </h3>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm">Name:</span>
                  <span className="text-sm font-medium">{document.uploader.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">ID:</span>
                  <span className="text-sm font-medium">{document.uploader.id}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                <TagIcon className="mr-2 h-4 w-4" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {document.tags.length > 0 ? (
                  document.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No tags</span>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                <FolderIcon className="mr-2 h-4 w-4" />
                Category & Location
              </h3>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm">Category:</span>
                  <span className="text-sm font-medium">{document.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Folder:</span>
                  <span className="text-sm font-medium">{document.folderId ? document.folderId : "Root"}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="preview">
        <TabsList>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>
        <TabsContent value="preview" className="mt-4">
          <Card>
            <CardContent className="p-6">{renderPreview()}</CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="activity" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {activities.length > 0 ? (
                  activities.map((activity) => (
                    <div key={activity.id} className="flex items-center p-4">
                      <div className="mr-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                          <UserIcon className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">{activity.userName}</span>{" "}
                          {activity.action === "upload" && "uploaded this document"}
                          {activity.action === "download" && "downloaded this document"}
                          {activity.action === "view" && "viewed this document"}
                          {activity.action === "edit" && "edited this document"}
                          {activity.action === "delete" && "attempted to delete this document"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(activity.timestamp), "PPP 'at' p")}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground">No activity recorded for this document.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

