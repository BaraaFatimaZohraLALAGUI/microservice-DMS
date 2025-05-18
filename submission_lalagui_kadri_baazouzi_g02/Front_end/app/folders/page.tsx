import { Metadata } from "next"
import { FoldersList } from "@/components/folders/folders-list"

export const metadata: Metadata = {
  title: "Folders | Document Management System",
  description: "Browse and manage your document folders",
}

export default function FoldersPage() {
  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <FoldersList />
    </div>
  )
}