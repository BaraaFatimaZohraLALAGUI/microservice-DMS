import { Metadata } from "next"
import { FolderForm } from "@/components/folders/folder-form"

export const metadata: Metadata = {
  title: "Create New Folder | Document Management System",
  description: "Create a new folder to organize your documents",
}

export default function NewFolderPage() {
  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <FolderForm />
    </div>
  )
}