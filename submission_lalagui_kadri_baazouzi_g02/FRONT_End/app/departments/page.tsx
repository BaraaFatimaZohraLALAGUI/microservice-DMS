"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { PlusIcon, Loader2Icon } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { Department, getAllDepartments } from '@/lib/department-api'
import DepartmentsList from '@/components/departments/departments-list'

export default function DepartmentsPage() {
    const { isAdmin } = useAuth()
    const router = useRouter()
    const [departments, setDepartments] = useState<Department[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadDepartments() {
            try {
                setIsLoading(true)
                setError(null)
                const data = await getAllDepartments()
                setDepartments(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load departments')
                console.error('Error loading departments:', err)
            } finally {
                setIsLoading(false)
            }
        }

        loadDepartments()
    }, [])

    return (
        <div className="container mx-auto py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Departments</h1>
                {isAdmin && (
                    <Button
                        onClick={() => router.push('/departments/new')}
                        className="flex items-center gap-2"
                    >
                        <PlusIcon className="h-4 w-4" />
                        <span>New Department</span>
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
            ) : departments.length > 0 ? (
                <DepartmentsList departments={departments} />
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>No Departments Found</CardTitle>
                        <CardDescription>
                            {isAdmin
                                ? "Get started by creating your first department."
                                : "No departments are available yet."}
                        </CardDescription>
                    </CardHeader>
                </Card>
            )}
        </div>
    )
} 