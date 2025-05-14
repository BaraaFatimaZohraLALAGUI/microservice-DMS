"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Card } from '@/components/ui/card'
import { MoreHorizontalIcon, UserIcon, PencilIcon, TrashIcon } from 'lucide-react'
import { Department, deleteDepartment } from '@/lib/department-api'
import { useAuth } from '@/contexts/auth-context'

interface DepartmentsListProps {
    departments: Department[]
}

export default function DepartmentsList({ departments }: DepartmentsListProps) {
    const { isAdmin } = useAuth()
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState<number | null>(null)
    const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null)

    const handleEdit = (department: Department) => {
        router.push(`/departments/${department.id}/edit`)
    }

    const handleManageUsers = (department: Department) => {
        router.push(`/departments/${department.id}/users`)
    }

    const handleDeleteClick = (department: Department) => {
        setDepartmentToDelete(department)
    }

    const handleDeleteConfirm = async () => {
        if (!departmentToDelete?.id) return

        try {
            setIsDeleting(departmentToDelete.id)
            setError(null)
            await deleteDepartment(departmentToDelete.id)
            // Refresh the page to show updated list
            router.refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete department')
            console.error('Error deleting department:', err)
        } finally {
            setIsDeleting(null)
            setDepartmentToDelete(null)
        }
    }

    const handleDeleteCancel = () => {
        setDepartmentToDelete(null)
    }

    return (
        <>
            {error && (
                <Card className="mb-6 p-4 bg-red-50 border-red-200">
                    <p className="text-red-600">{error}</p>
                </Card>
            )}

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {departments.map((department) => (
                            <TableRow key={department.id}>
                                <TableCell className="font-medium">{department.id}</TableCell>
                                <TableCell>{department.name}</TableCell>
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
                                                onClick={() => handleManageUsers(department)}
                                                className="cursor-pointer"
                                            >
                                                <UserIcon className="mr-2 h-4 w-4" />
                                                <span>Manage Users</span>
                                            </DropdownMenuItem>

                                            {isAdmin && (
                                                <>
                                                    <DropdownMenuItem
                                                        onClick={() => handleEdit(department)}
                                                        className="cursor-pointer"
                                                    >
                                                        <PencilIcon className="mr-2 h-4 w-4" />
                                                        <span>Edit</span>
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem
                                                        onClick={() => handleDeleteClick(department)}
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
            </Card>

            <AlertDialog
                open={!!departmentToDelete}
                onOpenChange={(open) => !open && handleDeleteCancel()}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the department
                            &quot;{departmentToDelete?.name}&quot; and remove all user associations.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={isDeleting !== null}
                        >
                            {isDeleting === departmentToDelete?.id ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
} 