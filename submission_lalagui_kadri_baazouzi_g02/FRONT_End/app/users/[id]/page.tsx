import { Suspense } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeftIcon, PencilIcon } from "lucide-react"
import UserDetails from "@/components/users/user-details"

interface UserPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function UserPage(props: UserPageProps) {
  const params = await props.params;
  // Use the ID as the username
  const username = params.id;

  if (!username) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/users">
            <Button variant="outline" size="icon">
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">User Details</h1>
        </div>
        <Link href={`/users/${username}/edit`}>
          <Button>
            <PencilIcon className="mr-2 h-4 w-4" />
            Edit User
          </Button>
        </Link>
      </div>

      <Suspense fallback={<UserDetailsSkeleton />}>
        <UserDetails userId={0} username={username} />
      </Suspense>
    </div>
  )
}

function UserDetailsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-8 w-48" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

