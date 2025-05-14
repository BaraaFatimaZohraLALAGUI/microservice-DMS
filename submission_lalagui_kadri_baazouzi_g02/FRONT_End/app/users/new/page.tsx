import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon } from "lucide-react"
import UserForm from "@/components/users/user-form"

export default function NewUserPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Link href="/users">
          <Button variant="outline" size="icon">
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Create New User</h1>
      </div>

      <UserForm />
    </div>
  )
}

