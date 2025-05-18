import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import UsersList from "@/components/users/users-list"
import UsersListSkeleton from "@/components/users/users-list-skeleton"
import RoleGuard from "@/components/auth/role-guard"

export default function UsersPage() {
  return (
    <RoleGuard allowedRoles={["admin"]} fallbackPath="/">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Users</h1>
            <p className="text-muted-foreground">Manage user accounts and permissions.</p>
          </div>
          <Link href="/users/new">
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </Link>
        </div>

        <Suspense fallback={<UsersListSkeleton />}>
          <UsersList />
        </Suspense>
      </div>
    </RoleGuard>
  )
}

