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
import { MoreHorizontalIcon, FolderIcon, PencilIcon, TrashIcon } from 'lucide-react'
import { Category, deleteCategory } from '@/lib/category-api'
import { useAuth } from '@/contexts/auth-context'

interface CategoriesListProps {
    categories: Category[]
}

export default function CategoriesList({ categories }: CategoriesListProps) {
    const { isAdmin } = useAuth()
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState<number | null>(null)
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)

    const handleEdit = (category: Category) => {
        router.push(`/categories/${category.id}/edit`)
    }

    const handleDeleteClick = (category: Category) => {
        setCategoryToDelete(category)
    }

    const handleDeleteConfirm = async () => {
        if (!categoryToDelete?.id) return

        try {
            setIsDeleting(categoryToDelete.id)
            setError(null)
            await deleteCategory(categoryToDelete.id)
            // Refresh the page to show updated list
            router.refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete category')
            console.error('Error deleting category:', err)
        } finally {
            setIsDeleting(null)
            setCategoryToDelete(null)
        }
    }

    const handleDeleteCancel = () => {
        setCategoryToDelete(null)
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
                            {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.map((category) => (
                            <TableRow key={category.id}>
                                <TableCell className="font-medium">{category.id}</TableCell>
                                <TableCell className="flex items-center gap-2">
                                    <FolderIcon className="h-4 w-4 text-muted-foreground" />
                                    {category.name}
                                </TableCell>
                                {isAdmin && (
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
                                                    onClick={() => handleEdit(category)}
                                                    className="cursor-pointer"
                                                >
                                                    <PencilIcon className="mr-2 h-4 w-4" />
                                                    <span>Edit</span>
                                                </DropdownMenuItem>

                                                <DropdownMenuItem
                                                    onClick={() => handleDeleteClick(category)}
                                                    className="cursor-pointer text-red-600 focus:text-red-600"
                                                >
                                                    <TrashIcon className="mr-2 h-4 w-4" />
                                                    <span>Delete</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            <AlertDialog
                open={!!categoryToDelete}
                onOpenChange={(open) => !open && handleDeleteCancel()}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the category
                            &quot;{categoryToDelete?.name}&quot;. Documents in this category may be
                            affected. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={isDeleting !== null}
                        >
                            {isDeleting === categoryToDelete?.id ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
} 