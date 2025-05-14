"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { ArrowLeft, Save, Folder, FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { createFolder, updateFolder, getFolderById, getFolders } from "@/lib/document-api"
import { useAuth } from "@/contexts/auth-context"
import type { Folder } from "@/lib/document-types"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Folder name must be at least 2 characters.",
  }).max(50, {
    message: "Folder name must not exceed 50 characters."
  }),
  description: z.string().max(200, {
    message: "Description must not exceed 200 characters.",
  }).optional(),
  parentId: z.string().nullable().optional(),
})

interface FolderFormProps {
  folderId?: string
}

export function FolderForm({ folderId }: FolderFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [parentFolders, setParentFolders] = useState<Folder[]>([])
  const [initialFolder, setInitialFolder] = useState<Folder | null>(null)
  const isEditing = !!folderId

  // Get the parent folder ID from query params (for creating a subfolder)
  const parentIdFromUrl = searchParams?.get("parentId")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      parentId: parentIdFromUrl || null,
    },
  })

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        // Load all folders for parent selection
        const folders = await getFolders()
        // Filter out the current folder (if editing) to prevent circular references
        const availableFolders = isEditing
          ? folders.filter((folder) => folder.id !== folderId)
          : folders
        setParentFolders(availableFolders)

        // If editing, load folder data
        if (isEditing && folderId) {
          const folder = await getFolderById(folderId)
          if (folder) {
            setInitialFolder(folder)
            form.reset({
              name: folder.name,
              description: folder.description || "",
              parentId: folder.parentId,
            })
          } else {
            toast({
              title: "Error",
              description: "Folder not found",
              variant: "destructive",
            })
            router.push("/folders")
          }
        }
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Error",
          description: "Failed to load data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [folderId, isEditing, form, toast, router, parentIdFromUrl])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to perform this action",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      if (isEditing && folderId) {
        // Update existing folder
        await updateFolder(folderId, {
          name: values.name,
          description: values.description || "",
          parentId: values.parentId,
        })
        toast({
          title: "Success",
          description: "Folder updated successfully",
        })
        router.push(`/folders/${folderId}`)
      } else {
        // Create new folder
        const newFolder = await createFolder({
          name: values.name,
          description: values.description || "",
          parentId: values.parentId,
          createdBy: {
            id: user.id,
            name: user.name,
          },
        })
        toast({
          title: "Success",
          description: "Folder created successfully",
        })
        router.push(`/folders/${newFolder.id}`)
      }
    } catch (error) {
      console.error("Error saving folder:", error)
      toast({
        title: "Error",
        description: isEditing
          ? "Failed to update folder"
          : "Failed to create folder",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Don't check for parent folder cycles if creating a new folder with no parentId
  const isParentFolderCycle = (folderId: string, parentId: string): boolean => {
    if (!folderId || !parentId) return false
    
    // Find the parent folder
    const parent = parentFolders.find(f => f.id === parentId)
    if (!parent) return false
    
    // Check if the parent's parent is the current folder (direct cycle)
    if (parent.parentId === folderId) return true
    
    // Check if any ancestor is the current folder (indirect cycle)
    if (parent.parentId) {
      return isParentFolderCycle(folderId, parent.parentId)
    }
    
    return false
  }

  // Filter parent folder options to prevent circular references
  const getValidParentOptions = () => {
    if (!isEditing) return parentFolders
    
    return parentFolders.filter(folder => 
      !isParentFolderCycle(folderId!, folder.id)
    )
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? "Edit Folder" : "Create New Folder"}
          </CardTitle>
          <CardDescription>
            {isEditing
              ? "Update the folder information"
              : "Create a new folder to organize your documents"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Folder Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter folder name" {...field} />
                    </FormControl>
                    <FormDescription>
                      Choose a descriptive name for your folder
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter a description for this folder"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Folder (Optional)</FormLabel>
                    <Select
                      value={field.value || ""}
                      onValueChange={(value) => {
                        field.onChange(value === "" ? null : value)
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a parent folder (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">
                          <div className="flex items-center">
                            <Folder className="mr-2 h-4 w-4" />
                            <span>Root (No parent)</span>
                          </div>
                        </SelectItem>
                        {getValidParentOptions().map((folder) => (
                          <SelectItem key={folder.id} value={folder.id}>
                            <div className="flex items-center">
                              <FolderOpen className="mr-2 h-4 w-4" />
                              <span>{folder.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {isEditing
                        ? "Select a parent folder or leave empty for root level"
                        : "Select a parent folder or leave empty to create at root level"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading || isSubmitting}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting
                    ? isEditing
                      ? "Updating..."
                      : "Creating..."
                    : isEditing
                    ? "Update Folder"
                    : "Create Folder"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}