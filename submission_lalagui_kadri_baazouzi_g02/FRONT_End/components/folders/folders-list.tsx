"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  Folder as FolderIcon, 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2,
  FolderInput,
  FolderOpen
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Skeleton } from "@/components/ui/skeleton"
import { getFolders, getDocumentsInFolder, deleteFolder } from "@/lib/document-api"
import type { Folder } from "@/lib/document-types"

export function FoldersList({ parentId = null }: { parentId?: string | null }) {
  const router = useRouter()
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingFolder, setDeletingFolder] = useState<string | null>(null)
  const [folderCounts, setFolderCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    const loadFolders = async () => {
      try {
        setLoading(true)
        const allFolders = await getFolders()
        const filteredFolders = allFolders.filter(folder => folder.parentId === parentId)
        setFolders(filteredFolders)
        
        // Get document counts for each folder
        const counts: Record<string, number> = {}
        for (const folder of filteredFolders) {
          const documents = await getDocumentsInFolder(folder.id)
          counts[folder.id] = documents.length
        }
        setFolderCounts(counts)
      } catch (error) {
        console.error("Error loading folders:", error)
      } finally {
        setLoading(false)
      }
    }
    
    loadFolders()
  }, [parentId])

  const handleDeleteFolder = async (folderId: string) => {
    try {
      await deleteFolder(folderId)
      setFolders(folders.filter(folder => folder.id !== folderId))
      router.refresh()
    } catch (error) {
      console.error("Error deleting folder:", error)
    } finally {
      setDeletingFolder(null)
    }
  }

  if (loading) {
    return <FoldersListSkeleton />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">
          {parentId ? "Subfolders" : "Folders"}
        </h2>
        <Button onClick={() => router.push("/folders/new")}>
          <Plus className="mr-2 h-4 w-4" /> New Folder
        </Button>
      </div>
      
      {folders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 border border-dashed rounded-lg bg-muted/30">
          <FolderIcon className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-1">No Folders Found</h3>
          <p className="text-sm text-muted-foreground mb-4">Create folders to organize your documents</p>
          <Button variant="outline" onClick={() => router.push("/folders/new")}>
            <Plus className="mr-2 h-4 w-4" /> Create Folder
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {folders.map((folder) => (
            <Card key={folder.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Link href={`/folders/${folder.id}`} className="hover:underline">
                    <CardTitle className="line-clamp-1">{folder.name}</CardTitle>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/folders/${folder.id}`)}>
                        <FolderOpen className="mr-2 h-4 w-4" />
                        Open
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/folders/${folder.id}/edit`)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive" 
                        onClick={() => setDeletingFolder(folder.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription className="line-clamp-2">
                  {folder.description || "No description provided"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <FolderIcon className="mr-2 h-4 w-4" />
                  <span>{folderCounts[folder.id] || 0} documents</span>
                </div>
              </CardContent>
              <CardFooter className="pt-2 text-xs text-muted-foreground">
                Created {new Date(folder.createdDate).toLocaleDateString()} by {folder.createdBy.name}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deletingFolder} onOpenChange={(open) => !open && setDeletingFolder(null)}>
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
              onClick={() => deletingFolder && handleDeleteFolder(deletingFolder)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export function FoldersListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
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
  )
}