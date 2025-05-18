"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: ("admin" | "user")[]
  fallbackPath?: string
}

export default function RoleGuard({ children, allowedRoles, fallbackPath = "/" }: RoleGuardProps) {
  const { user, isLoading, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return;

    // Check if the user has the necessary role
    const hasRequiredRole =
      (allowedRoles.includes("admin") && isAdmin) ||
      (allowedRoles.includes("user") && user && !isAdmin);

    if (!hasRequiredRole) {
      console.log("Redirecting - User lacks required role. Allowed roles:", allowedRoles, "isAdmin:", isAdmin);
      router.push(fallbackPath);
    }
  }, [user, isLoading, isAdmin, allowedRoles, fallbackPath, router])

  if (isLoading) {
    return <div>Loading...</div>
  }

  // Check if user has the required role before rendering children
  const hasRequiredRole =
    (allowedRoles.includes("admin") && isAdmin) ||
    (allowedRoles.includes("user") && user && !isAdmin);

  if (!hasRequiredRole) {
    return null;
  }

  return <>{children}</>
}

