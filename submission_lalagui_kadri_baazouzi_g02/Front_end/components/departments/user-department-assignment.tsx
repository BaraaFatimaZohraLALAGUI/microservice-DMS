"use client"

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Loader2Icon, SearchIcon, PlusIcon, TrashIcon, UserIcon } from 'lucide-react'
import { getDepartmentById } from '@/lib/department-api'
import { getAllUsers } from '@/lib/user-api'

interface UserDepartmentAssignmentProps {
    departmentId: number
    onAssignUser: (userId: string) => Promise<void>
    onRemoveUser: (userId: string) => Promise<void>
    isAdmin: boolean
}

export default function UserDepartmentAssignment({
    departmentId,
    onAssignUser,
    onRemoveUser,
    isAdmin
}: UserDepartmentAssignmentProps) {
    const [department, setDepartment] = useState<any>(null)
    const [users, setUsers] = useState<any[]>([])
    const [selectedUser, setSelectedUser] = useState<string>('')
    const [searchQuery, setSearchQuery] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [isAssigning, setIsAssigning] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Load department and users
    useEffect(() => {
        async function loadData() {
            try {
                setIsLoading(true)
                setError(null)

                // Load department with users
                const departmentData = await getDepartmentById(departmentId)
                setDepartment(departmentData)

                // Load all users for selection
                const usersData = await getAllUsers()
                setUsers(usersData)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load data')
                console.error('Error loading data:', err)
            } finally {
                setIsLoading(false)
            }
        }

        loadData()
    }, [departmentId])

    // Handle user assignment
    const handleAssignUser = async () => {
        if (!selectedUser) return

        try {
            setIsAssigning(true)
            setError(null)
            await onAssignUser(selectedUser)
            setSelectedUser('')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to assign user')
        } finally {
            setIsAssigning(false)
        }
    }

    // Handle user removal
    const handleRemoveUser = async (userId: string) => {
        try {
            setError(null)
            await onRemoveUser(userId)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to remove user')
        }
    }

    // Filter department users based on search query
    const filteredUsers = department?.users?.filter((user: any) =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
    ) || []

    // Filter available users (those not already in the department)
    const availableUsers = users.filter(user =>
        !department?.users?.some((deptUser: any) => deptUser.username === user.username)
    )

    return (
        <div>
            {error && (
                <div className="mb-4 p-3 rounded-md bg-red-50 text-red-600">
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="flex justify-center items-center py-12">
                    <Loader2Icon className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <>
                    {/* User Assignment Form */}
                    {isAdmin && (
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>Assign User to Department</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-end gap-3">
                                    <div className="flex-1">
                                        <Select
                                            value={selectedUser}
                                            onValueChange={setSelectedUser}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a user" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableUsers.map(user => (
                                                    <SelectItem key={user.username} value={user.username}>
                                                        {user.username}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button
                                        onClick={handleAssignUser}
                                        disabled={!selectedUser || isAssigning}
                                        className="flex items-center gap-2"
                                    >
                                        {isAssigning ? (
                                            <Loader2Icon className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <PlusIcon className="h-4 w-4" />
                                        )}
                                        Assign User
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Users List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Department Users</CardTitle>
                            <div className="relative mt-4">
                                <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search users..."
                                    className="pl-8"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            {filteredUsers.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Username</TableHead>
                                            <TableHead>Roles</TableHead>
                                            {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredUsers.map((user: any) => (
                                            <TableRow key={user.username}>
                                                <TableCell className="flex items-center gap-2">
                                                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                                                    {user.username}
                                                </TableCell>
                                                <TableCell>
                                                    {user.roles?.join(', ') || 'No roles'}
                                                </TableCell>
                                                {isAdmin && (
                                                    <TableCell className="text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleRemoveUser(user.username)}
                                                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            <span className="sr-only">Remove user</span>
                                                            <TrashIcon className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="py-12 text-center text-muted-foreground">
                                    {searchQuery ? 'No users match your search' : 'No users assigned to this department'}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    )
} 