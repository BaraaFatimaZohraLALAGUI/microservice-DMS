"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ArrowLeftIcon, Loader2Icon } from 'lucide-react'
import { createDepartment } from '@/lib/department-api'
import { useAuth } from '@/contexts/auth-context'

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Department name must be at least 2 characters.",
    }),
})

export default function NewDepartmentPage() {
    const { isAdmin } = useAuth()
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // If not admin, redirect to departments page
    if (!isAdmin) {
        router.push('/departments')
        return null
    }

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            setIsSubmitting(true)
            setError(null)
            await createDepartment({ name: values.name })
            router.push('/departments')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create department')
            console.error('Error creating department:', err)
            setIsSubmitting(false)
        }
    }

    return (
        <div className="container mx-auto py-6 max-w-md">
            <Button
                variant="outline"
                className="mb-6 flex items-center gap-2"
                onClick={() => router.back()}
            >
                <ArrowLeftIcon className="h-4 w-4" />
                <span>Back</span>
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle>Create New Department</CardTitle>
                    <CardDescription>
                        Add a new department to your organization.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="mb-4 p-3 rounded-md bg-red-50 text-red-600">
                            {error}
                        </div>
                    )}

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Department Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Finance" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : "Create Department"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <div className="text-sm text-muted-foreground">
                        All departments can be managed by administrators.
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
} 