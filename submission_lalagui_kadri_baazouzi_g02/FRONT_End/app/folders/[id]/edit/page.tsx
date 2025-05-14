import { Metadata } from "next"
import { FolderForm } from "@/components/folders/folder-form"

interface EditFolderPageProps {
  params: Promise<{
    id: string
  }>
}

export const metadata: Metadata = {
  title: "Edit Folder | Document Management System",
  description: "Edit folder details",
}

export default async function EditFolderPage(props: EditFolderPageProps) {
  const params = await props.params;
  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <FolderForm folderId={params.id} />
    </div>
  )
}