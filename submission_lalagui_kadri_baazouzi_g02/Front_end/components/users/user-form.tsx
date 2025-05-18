"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2Icon } from "lucide-react"
import { cn } from "@/lib/utils"
import { getUserByUsername, updateUser, type User } from "@/lib/user-api"
import { createUser as createBackendUser } from "@/lib/user-api"
import { useAuth } from "@/contexts/auth-context"
import { getAllDepartments, type Department } from "@/lib/department-api"

// Define the form schema
const userFormSchema = z.object({
  username: z.string().min(2, { message: "Username must be at least 2 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).optional(),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(5, { message: "Please enter a valid phone number" }),
  position: z.string().min(2, { message: "Position is required" }),
  department: z.string().min(1, { message: "Department is required" }),
  status: z.string().min(1, { message: "Status is required" }),
  address: z.string().min(5, { message: "Address is required" }),
  hire_date: z.date(),
  employee_id: z.coerce.number().int().positive(),
})

type UserFormValues = z.infer<typeof userFormSchema>

interface UserFormProps {
  userId?: number; // Keep for backward compatibility
  username?: string;
}

export default function UserForm({ userId, username }: UserFormProps) {
  const router = useRouter()
  const { isAdmin } = useAuth()
  const [loading, setLoading] = useState(!!username)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [departments, setDepartments] = useState<Department[]>([])

  // Initialize the form
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "",
      password: username ? undefined : "",
      name: "",
      email: "",
      phone: "",
      position: "",
      department: "",
      status: "Active",
      address: "",
      hire_date: new Date(),
      employee_id: 0,
    },
  })

  // Load departments from API
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const departmentsData = await getAllDepartments();
        setDepartments(departmentsData);
      } catch (err) {
        console.error("Failed to load departments:", err);
      }
    };

    fetchDepartments();
  }, []);

  // Admin check and data fetching
  useEffect(() => {
    // If not admin, redirect to home page
    if (!isAdmin) {
      router.push('/')
      return;
    }

    if (username) {
      const fetchUser = async () => {
        try {
          const userData = await getUserByUsername(username)

          // Format any date fields if they exist
          const hireDate = userData.hireDate ? new Date(userData.hireDate) : new Date();

          form.reset({
            username: userData.username,
            name: userData.name || "",
            email: userData.email || "",
            phone: userData.phone || "",
            position: userData.position || "",
            department: userData.department || "",
            status: userData.status || "Active",
            address: userData.address || "",
            hire_date: hireDate,
            employee_id: userData.employeeId || 0,
          })
        } catch (err) {
          setError("Failed to load user data")
          console.error(err)
        } finally {
          setLoading(false)
        }
      }

      fetchUser()
    }
  }, [username, form, isAdmin, router])

  const onSubmit = async (data: UserFormValues) => {
    try {
      setIsSubmitting(true)
      setError(null)

      if (username) {
        // Create a copy of the data for updates
        const updateData = {
          name: data.name,
          email: data.email,
          phone: data.phone,
          position: data.position,
          department: data.department,
          status: data.status,
          address: data.address,
          hireDate: data.hire_date,
          employeeId: data.employee_id
        };

        // Only include password if it has been provided (not empty string)
        if (data.password && data.password.trim() !== '') {
          (updateData as any).password = data.password;
        }

        // Update existing user with profile data
        await updateUser(username, updateData);

        router.push(`/users/${username}`)
      } else {
        // Create new user on the backend with complete profile data
        await createBackendUser({
          username: data.username,
          password: data.password as string,
          name: data.name,
          email: data.email,
          phone: data.phone,
          position: data.position,
          department: data.department,
          status: data.status,
          address: data.address,
          hireDate: data.hire_date,
          employeeId: data.employee_id
        });

        router.push('/users')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save user data')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2Icon className="animate-spin h-8 w-8 text-primary" />
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>{username ? "Edit User" : "Create New User"}</CardTitle>
            <CardDescription>
              {username ? "Update user information" : "Add a new user to your system"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && <div className="rounded-md bg-red-50 p-4 text-sm text-red-500">{error}</div>}

            {/* Authentication fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Authentication Details</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="johndoe" disabled={!!username} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!username && (
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {username && (
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password (optional)</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Leave blank to keep current password" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>

            {/* User profile fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">User Profile</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="123-456-7890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="employee_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employee ID</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position</FormLabel>
                      <FormControl>
                        <Input placeholder="Software Engineer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments.length > 0 ? (
                            departments.map((dept) => (
                              <SelectItem key={dept.id} value={dept.name}>
                                {dept.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled>No departments found</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                          <SelectItem value="Pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hire_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Hire Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Street, City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  {username ? "Updating..." : "Creating..."}
                </>
              ) : (
                username ? "Update User" : "Create User"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}

