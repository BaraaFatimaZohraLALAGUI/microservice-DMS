"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  MoreHorizontalIcon,
  Loader2Icon,
  UserIcon,
  PencilIcon,
  TrashIcon,
} from "lucide-react"
import { getAllUsers, deleteUser, User } from "@/lib/user-api"
import { useAuth } from "@/contexts/auth-context"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function UsersList() {
  const router = useRouter()
  const { isAdmin } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Load users data
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      try {
        console.log("Fetching all users data...");
        const data = await getAllUsers()

        // Log the user data to debug
        console.log("Users data received:", data);

        if (data && Array.isArray(data)) {
          console.log(`Received ${data.length} users with fields:`,
            data.length > 0 ? Object.keys(data[0]) : 'none');

          // Make sure we process the data even if it's in an unexpected format
          const processedUsers = data.map(user => {
            // Ensure the roles field is always an array
            const roles = user.roles || [];
            return {
              ...user,
              roles: Array.isArray(roles) ? roles : [roles]
            };
          });

          setUsers(processedUsers)
        } else {
          console.error("Invalid users data format:", data);
          setError("Received invalid user data format");
        }
      } catch (error) {
        console.error("Failed to fetch users:", error)
        setError(error instanceof Error ? error.message : 'Failed to load users')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const handleManageUser = (username: string) => {
    // Navigate to user details page
    router.push(`/users/${username}`)
  }

  const handleEditUser = (username: string) => {
    // Navigate to edit user page
    router.push(`/users/${username}/edit`)
  }

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user)
  }

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return

    try {
      setIsDeleting(true)
      setError(null)
      await deleteUser(userToDelete.username)

      // Remove deleted user from the list
      setUsers(prev => prev.filter(user => user.username !== userToDelete.username))

      // Close dialog
      setUserToDelete(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user')
      console.error('Error deleting user:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setUserToDelete(null)
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ROLE_ADMIN":
        return <Badge className="bg-purple-500">Admin</Badge>
      case "ROLE_USER":
        return <Badge variant="secondary">User</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  return (
    <>
      {error && (
        <div className="mb-4 p-3 rounded-md bg-red-50 text-red-600">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Manage user accounts and access
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2Icon className="animate-spin h-8 w-8 text-primary" />
            </div>
          ) : users.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.username}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                      {user.username}
                    </TableCell>
                    <TableCell>
                      {user.name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles?.map((role, i) => (
                          <span key={i}>{getRoleBadge(role)}</span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.department || 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontalIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            onClick={() => handleManageUser(user.username)}
                            className="cursor-pointer"
                          >
                            <UserIcon className="mr-2 h-4 w-4" />
                            <span>View Details</span>
                          </DropdownMenuItem>

                          {isAdmin && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleEditUser(user.username)}
                                className="cursor-pointer"
                              >
                                <PencilIcon className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(user)}
                                className="cursor-pointer text-red-600 focus:text-red-600"
                              >
                                <TrashIcon className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No users found. Create your first user to get started.
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={!!userToDelete}
        onOpenChange={(open) => !open && handleDeleteCancel()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user
              &quot;{userToDelete?.username}&quot; from the system.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

