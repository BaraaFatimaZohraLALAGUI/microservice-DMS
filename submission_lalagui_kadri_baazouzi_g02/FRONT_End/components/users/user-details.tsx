"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Loader2Icon, TrashIcon } from "lucide-react"
import { getUserByUsername, deleteUser, type User } from "@/lib/user-api"

interface UserDetailsProps {
  userId?: number; // Keep for backwards compatibility
  username?: string;
}

export default function UserDetails({ userId, username }: UserDetailsProps) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Use username parameter if provided, otherwise try to derive from userId
        const userIdentifier = username || (userId ? `user${userId}` : null);

        if (!userIdentifier) {
          setError("No username provided");
          setLoading(false);
          return;
        }

        const userData = await getUserByUsername(userIdentifier)
        setUser(userData)
      } catch (err) {
        setError("Failed to load user details")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [userId, username])

  const handleDelete = async () => {
    if (!user) return

    try {
      setIsDeleting(true)
      await deleteUser(user.username)
      router.push("/users")
    } catch (err) {
      setError("Failed to delete user")
      console.error(err)
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2Icon className="animate-spin h-8 w-8 text-primary" />
      </div>
    )
  }

  if (error) {
    return <div className="p-4 bg-red-50 text-red-600 rounded-md">{error}</div>
  }

  if (!user) {
    return <div className="p-4 bg-yellow-50 text-yellow-600 rounded-md">User not found</div>
  }

  const getStatusBadge = (status?: string) => {
    if (!status) return <Badge variant="outline">Unknown</Badge>

    switch (status.toLowerCase()) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>
      case "inactive":
        return <Badge variant="outline">Inactive</Badge>
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{user.name || user.username}</CardTitle>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <TrashIcon className="mr-2 h-4 w-4" />
              Delete User
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the user account and all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Username</h3>
            <div className="mt-1">{user.username}</div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Roles</h3>
            <div className="mt-1 flex flex-wrap gap-1">
              {user.roles?.map((role, i) => (
                <Badge key={i} variant="secondary">{role}</Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
            <div className="mt-1">{getStatusBadge(user.status)}</div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Employee ID</h3>
            <div className="mt-1">{user.employeeId || 'N/A'}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
            <div className="mt-1">{user.email || 'N/A'}</div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
            <div className="mt-1">{user.phone || 'N/A'}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Position</h3>
            <div className="mt-1">{user.position || 'N/A'}</div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Department</h3>
            <div className="mt-1">{user.department || 'N/A'}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Hire Date</h3>
            <div className="mt-1">
              {user.hireDate
                ? new Date(user.hireDate).toLocaleDateString()
                : 'N/A'}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Address</h3>
            <div className="mt-1">{user.address || 'N/A'}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

