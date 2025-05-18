import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { DocumentsList } from "@/components/documents/documents-list"
import DocumentsListSkeleton from "@/components/documents/documents-list-skeleton"

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">Manage and organize your documents.</p>
        </div>
        <Link href="/documents/upload">
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        </Link>
      </div>

      <Suspense fallback={<DocumentsListSkeleton />}>
        <DocumentsList />
      </Suspense>
    </div>
  )
}

