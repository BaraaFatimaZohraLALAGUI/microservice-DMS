import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon } from "lucide-react"
import DocumentUploadForm from "@/components/documents/document-upload-form"

export default function UploadDocumentPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Link href="/documents">
          <Button variant="outline" size="icon">
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Upload Document</h1>
      </div>

      <DocumentUploadForm />
    </div>
  )
}

