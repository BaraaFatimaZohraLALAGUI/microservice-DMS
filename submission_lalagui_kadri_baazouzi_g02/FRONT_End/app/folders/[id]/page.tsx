import { Metadata } from "next"
import { FolderDetails } from "@/components/folders/folder-details"

interface FolderPageProps {
  params: Promise<{
    id: string
  }>
}

export const metadata: Metadata = {
  title: "Folder Details | Document Management System",
  description: "View folder details and contained documents",
}

export default async function FolderPage(props: FolderPageProps) {
  const params = await props.params;
  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <FolderDetails folderId={params.id} />
    </div>
  )
}