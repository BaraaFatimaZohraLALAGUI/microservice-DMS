"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getDocumentById, updateDocument } from "@/lib/document-api"
import { DOCUMENT_CATEGORIES, DOCUMENT_TAGS } from "@/lib/document-types"

// Define the form schema
const documentFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  description: z.string().optional(),
  category: z.string().min(1, { message: "Category is required" }),
  tags: z.array(z.string()).optional(),
  privacy: z.enum(["public", "private"]),
  folderId: z.string().optional().nullable(),
})

type DocumentFormValues = z.infer<typeof documentFormSchema>

interface DocumentEditFormProps {
  documentId: string
}

export default function DocumentEditForm({ documentId }: DocumentEditFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize the form
  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      tags: [],
      privacy: "public",
      folderId: null,
    },
  })

  // Fetch document data
  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const document = await getDocumentById(documentId)

        if (document) {
          form.reset({
            name: document.name,
            description: document.description,
            category: document.category,
            tags: document.tags,
            privacy: document.privacy,
            folderId: document.folderId,
          })
        } else {
          setError("Document not found")
        }
      } catch (err) {
        setError("Failed to load document data")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchDocument()
  }, [documentId, form])

  const onSubmit = async (data: DocumentFormValues) => {
    setSaving(true)
    setError(null)

    try {
      await updateDocument(documentId, data)
      router.push(`/documents/${documentId}`)
    } catch (err) {
      setError("Failed to update document")
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div>Loading document data...</div>
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardContent className="space-y-6 pt-6">
            {error && <div className="rounded-md bg-red-50 p-4 text-sm text-red-500">{error}</div>}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter document name" {...field} />
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
                    <Textarea placeholder="Enter a description for the document" className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DOCUMENT_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="privacy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Privacy Setting</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select privacy level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="public">Public (All users can access)</SelectItem>
                        <SelectItem value="private">Private (Only you can access)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Determine who can access this document.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="tags"
              render={() => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {DOCUMENT_TAGS.map((tag) => {
                        const isSelected = form.getValues("tags")?.includes(tag) || false

                        return (
                          <Badge
                            key={tag}
                            variant={isSelected ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => {
                              const currentTags = form.getValues("tags") || []
                              if (isSelected) {
                                form.setValue(
                                  "tags",
                                  currentTags.filter((t) => t !== tag),
                                )
                              } else {
                                form.setValue("tags", [...currentTags, tag])
                              }
                            }}
                          >
                            {tag}
                          </Badge>
                        )
                      })}
                    </div>
                    <FormDescription>Click on tags to select or deselect them.</FormDescription>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="folderId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Folder</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a folder" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="root">Root (No folder)</SelectItem>
                      <SelectItem value="folder-1">Financial Documents</SelectItem>
                      <SelectItem value="folder-2">HR Documents</SelectItem>
                      <SelectItem value="folder-3">Marketing Materials</SelectItem>
                      <SelectItem value="folder-4">Project Plans</SelectItem>
                      <SelectItem value="folder-5">Technical Documentation</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Choose a folder to organize this document.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => router.push(`/documents/${documentId}`)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}

