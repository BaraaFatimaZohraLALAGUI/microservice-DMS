"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  Folder as FolderIcon, 
  ArrowLeft, 
  Edit, 
  Trash2, 
  UploadCloud,
  FilePlus,
  FolderPlus
} from "lucide-react"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { FoldersList } from "@/components/folders/folders-list"
import { DocumentsList } from "@/components/documents/documents-list"
import { getFolderById, getDocumentsInFolder, deleteFolder, getFolders } from "@/lib/document-api"
import type { Folder, Document } from "@/lib/document-types"

interface FolderDetailsProps {
  folderId: string
}

export function FolderDetails({ folderId }: FolderDetailsProps) {
  const router = useRouter()
  const [folder, setFolder] = useState<Folder | null>(null)
  const [parentFolders, setParentFolders] = useState<Folder[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const folderData = await getFolderById(folderId)
        setFolder(folderData)

        if (folderData) {
          // Load documents in this folder
          const docsInFolder = await getDocumentsInFolder(folderId)
          setDocuments(docsInFolder)
          
          // Build breadcrumb path by finding parent folders
          if (folderData.parentId) {
            await buildParentFolderPath(folderData.parentId)
          }
        }
      } catch (error) {
        console.error("Error loading folder details:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [folderId])

  const buildParentFolderPath = async (parentId: string | null) => {
    if (!parentId) return
    
    const allFolders = await getFolders()
    const parentFolder = allFolders.find(f => f.id === parentId)
    
    if (parentFolder) {
      setParentFolders(prev => [parentFolder, ...prev])
      if (parentFolder.parentId) {
        await buildParentFolderPath(parentFolder.parentId)
      }
    }
  }

  const handleDeleteFolder = async () => {
    try {
      await deleteFolder(folderId)
      router.push('/folders')
    } catch (error) {
      console.error("Error deleting folder:", error)
    } finally {
      setDeleteDialogOpen(false)
    }
  }

  if (loading) {
    return <FolderDetailsSkeleton />
  }

  if (!folder) {
    return (
      <div className="space-y-6">
        <Button variant="outline" size="sm" onClick={() => router.push('/folders')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Folders
        </Button>
        <div className="flex flex-col items-center justify-center p-12 border rounded-lg bg-muted/30">
          <h3 className="text-xl font-semibold mb-2">Folder Not Found</h3>
          <p className="text-muted-foreground mb-4">The folder you're looking for doesn't exist or has been deleted.</p>
          <Button onClick={() => router.push('/folders')}>Go to Folders</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb className="mb-6">
        <BreadcrumbItem>
          <BreadcrumbLink href="/folders">Folders</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        {parentFolders.map((parent) => (
          <div key={parent.id} className="flex items-center">
            <BreadcrumbItem>
              <BreadcrumbLink href={`/folders/${parent.id}`}>{parent.name}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </div>
        ))}
        <BreadcrumbItem>
          <span className="font-semibold">{folder.name}</span>
        </BreadcrumbItem>
      </Breadcrumb>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{folder.name}</h1>
          <p className="text-muted-foreground mt-1">{folder.description || "No description provided"}</p>
          <div className="text-sm text-muted-foreground mt-2">
            Created {new Date(folder.createdDate).toLocaleDateString()} by {folder.createdBy.name}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/documents/upload?folderId=${folderId}`)}>
            <UploadCloud className="mr-2 h-4 w-4" /> Upload
          </Button>
          <Button variant="outline" onClick={() => router.push(`/folders/new?parentId=${folderId}`)}>
            <FolderPlus className="mr-2 h-4 w-4" /> New Subfolder
          </Button>
          <Button variant="outline" onClick={() => router.push(`/folders/${folderId}/edit`)}>
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button variant="outline" className="text-destructive" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      {/* Subfolders */}
      <div className="mt-8">
        <FoldersList parentId={folderId} />
      </div>

      {/* Documents in this folder */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Documents</h2>
          <Button onClick={() => router.push(`/documents/upload?folderId=${folderId}`)}>
            <FilePlus className="mr-2 h-4 w-4" /> Add Document
          </Button>
        </div>
        
        {documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 border border-dashed rounded-lg bg-muted/30">
            <UploadCloud className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-1">No Documents Found</h3>
            <p className="text-sm text-muted-foreground mb-4">Upload documents to this folder</p>
            <Button variant="outline" onClick={() => router.push(`/documents/upload?folderId=${folderId}`)}>
              <UploadCloud className="mr-2 h-4 w-4" /> Upload Document
            </Button>
          </div>
        ) : (
          <DocumentsList
            initialParams={{
              page: 1,
              perPage: 10,
              sortBy: "uploadDate",
              order: "desc",
              filters: { folderId }
            }}
            hideFilters={true}
          />
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this folder. Documents within the folder will be moved to the root directory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteFolder}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export function FolderDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-64 mb-8" />

      <div className="flex items-start justify-between">
        <div>
          <Skeleton className="h-10 w-72 mb-2" />
          <Skeleton className="h-5 w-96 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      <div className="mt-8">
        <Skeleton className="h-8 w-40 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3 mt-1" />
              </CardHeader>
              <CardContent className="pb-2">
                <Skeleton className="h-4 w-32" />
              </CardContent>
              <CardFooter className="pt-2">
                <Skeleton className="h-4 w-40" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <Skeleton className="h-8 w-40 mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}