import { Suspense } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeftIcon } from "lucide-react"
import UserForm from "@/components/users/user-form"

interface EditUserPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditUserPage(props: EditUserPageProps) {
  const params = await props.params;
  // Use the ID as username
  const username = params.id;

  if (!username) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Link href={`/users/${username}`}>
          <Button variant="outline" size="icon">
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
      </div>

      <Suspense fallback={<UserFormSkeleton />}>
        <UserForm username={username} />
      </Suspense>
    </div>
  )
}

function UserFormSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 8 }).map((_, i) => (
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

