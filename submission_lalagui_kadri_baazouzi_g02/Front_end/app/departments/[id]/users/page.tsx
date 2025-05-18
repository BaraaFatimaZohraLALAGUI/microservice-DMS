"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { ArrowLeftIcon, Loader2Icon } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { getDepartmentById, assignUserToDepartment, removeUserFromDepartment } from '@/lib/department-api'
import UserDepartmentAssignment from '@/components/departments/user-department-assignment'

interface PageProps {
    params: {
        id: string
    }
}

export default function DepartmentUsersPage({ params }: PageProps) {
    const { isAdmin } = useAuth()
    const router = useRouter()
    const departmentId = parseInt(params.id, 10)
    const [department, setDepartment] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadDepartment() {
            try {
                setIsLoading(true)
                setError(null)
                const data = await getDepartmentById(departmentId)
                setDepartment(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load department')
                console.error('Error loading department:', err)
            } finally {
                setIsLoading(false)
            }
        }

        if (!isNaN(departmentId)) {
            loadDepartment()
        } else {
            setError('Invalid department ID')
            setIsLoading(false)
        }
    }, [departmentId])

    const handleAssignUser = async (userId: string) => {
        try {
            setError(null)
            await assignUserToDepartment(departmentId, userId)
            // Refresh the department to show updated user list
            const updated = await getDepartmentById(departmentId)
            setDepartment(updated)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to assign user to department')
            console.error('Error assigning user:', err)
        }
    }

    const handleRemoveUser = async (userId: string) => {
        try {
            setError(null)
            await removeUserFromDepartment(departmentId, userId)
            // Refresh the department to show updated user list
            const updated = await getDepartmentById(departmentId)
            setDepartment(updated)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to remove user from department')
            console.error('Error removing user:', err)
        }
    }

    return (
        <div className="container mx-auto py-6">
            <Button
                variant="outline"
                className="mb-6 flex items-center gap-2"
                onClick={() => router.push('/departments')}
            >
                <ArrowLeftIcon className="h-4 w-4" />
                <span>Back to Departments</span>
            </Button>

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
            ) : department ? (
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold">
                            Department: {department.name}
                        </h1>
                    </div>

                    <UserDepartmentAssignment
                        departmentId={departmentId}
                        onAssignUser={handleAssignUser}
                        onRemoveUser={handleRemoveUser}
                        isAdmin={isAdmin}
                    />
                </div>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Department Not Found</CardTitle>
                        <CardDescription>
                            The requested department could not be found.
                        </CardDescription>
                    </CardHeader>
                </Card>
            )}
        </div>
    )
} 