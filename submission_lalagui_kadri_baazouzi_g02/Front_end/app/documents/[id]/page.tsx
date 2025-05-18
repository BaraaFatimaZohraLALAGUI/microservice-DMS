import { Suspense } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon, PencilIcon } from "lucide-react"
import DocumentDetails from "@/components/documents/document-details"
import DocumentDetailsSkeleton from "@/components/documents/document-details-skeleton"

interface DocumentPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function DocumentPage(props: DocumentPageProps) {
  const params = await props.params;
  // Validate that the ID is valid
  if (!params.id) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/documents">
            <Button variant="outline" size="icon">
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Document Details</h1>
        </div>
        <Link href={`/documents/${params.id}/edit`}>
          <Button>
            <PencilIcon className="mr-2 h-4 w-4" />
            Edit Document
          </Button>
        </Link>
      </div>

      <Suspense fallback={<DocumentDetailsSkeleton />}>
        <DocumentDetails documentId={params.id} />
      </Suspense>
    </div>
  )
}

