"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { PlusIcon, Loader2Icon } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { Category, getAllCategories } from '@/lib/category-api'
import CategoriesList from '@/components/categories/categories-list'

export default function CategoriesPage() {
    const { isAdmin } = useAuth()
    const router = useRouter()
    const [categories, setCategories] = useState<Category[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadCategories() {
            try {
                setIsLoading(true)
                setError(null)
                const data = await getAllCategories()
                setCategories(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load categories')
                console.error('Error loading categories:', err)
            } finally {
                setIsLoading(false)
            }
        }

        loadCategories()
    }, [])

    return (
        <div className="container mx-auto py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Categories</h1>
                {isAdmin && (
                    <Button
                        onClick={() => router.push('/categories/new')}
                        className="flex items-center gap-2"
                    >
                        <PlusIcon className="h-4 w-4" />
                        <span>New Category</span>
                    </Button>
                )}
            </div>

            {error && (
                <Card className="mb-6 bg-red-50 border-red-200">
                    <CardContent className="pt-6">
                        <p className="text-red-600">{error}</p>
                    </CardContent>
                </Card>
            )}

            {isLoading ? (
                <div className="flex justify-center items-center py-12">
                    <Loader2Icon className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : categories.length > 0 ? (
                <CategoriesList categories={categories} />
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>No Categories Found</CardTitle>
                        <CardDescription>
                            {isAdmin
                                ? "Get started by creating your first category."
                                : "No categories are available yet."}
                        </CardDescription>
                    </CardHeader>
                </Card>
            )}
        </div>
    )
} 