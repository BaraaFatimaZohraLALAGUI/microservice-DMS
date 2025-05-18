import { Suspense } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeftIcon } from "lucide-react"
import DocumentEditForm from "@/components/documents/document-edit-form"

interface EditDocumentPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditDocumentPage(props: EditDocumentPageProps) {
  const params = await props.params;
  // Validate that the ID is valid
  if (!params.id) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Link href={`/documents/${params.id}`}>
          <Button variant="outline" size="icon">
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Edit Document</h1>
      </div>

      <Suspense fallback={<DocumentEditFormSkeleton />}>
        <DocumentEditForm documentId={params.id} />
      </Suspense>
    </div>
  )
}

function DocumentEditFormSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex justify-end space-x-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  )
}

