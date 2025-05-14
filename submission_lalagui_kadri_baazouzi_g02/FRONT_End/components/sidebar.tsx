"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboardIcon,
  UsersIcon,
  FolderIcon,
  FileTextIcon,
  StarIcon,
  SettingsIcon,
  MenuIcon,
  XIcon,
  BuildingIcon,
  TagIcon,
} from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { isAdmin } = useAuth()

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const routes = [
    {
      href: "/",
      icon: LayoutDashboardIcon,
      title: "Dashboard",
    },
    ...(isAdmin
      ? [
        {
          href: "/users",
          icon: UsersIcon,
          title: "Users",
        },
      ]
      : []),
    {
      href: "/departments",
      icon: BuildingIcon,
      title: "Departments",
    },
    {
      href: "/categories",
      icon: TagIcon,
      title: "Categories",
    },
    {
      href: "/documents",
      icon: FileTextIcon,
      title: "Documents",
    },
    {
      href: "/folders",
      icon: FolderIcon,
      title: "Folders",
    },
    {
      href: "/favorites",
      icon: StarIcon,
      title: "Favorites",
    },
    {
      href: "/settings",
      icon: SettingsIcon,
      title: "Settings",
    },
  ]

  return (
    <>
      <Button variant="outline" size="icon" className="fixed left-4 top-4 z-40 md:hidden" onClick={toggleSidebar}>
        {isOpen ? <XIcon className="h-4 w-4" /> : <MenuIcon className="h-4 w-4" />}
      </Button>

      <div
        className={cn("fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden", isOpen ? "block" : "hidden")}
        onClick={toggleSidebar}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r bg-background transition-transform md:sticky",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          className,
        )}
      >
        <div className="border-b px-6 py-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <FileTextIcon className="h-6 w-6" />
            <span>DMS</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-4">
          <nav className="grid gap-1 px-2">
            {routes.map((route) => (
              <Link key={route.href} href={route.href} onClick={() => setIsOpen(false)}>
                <span
                  className={cn(
                    "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                    pathname === route.href ? "bg-accent text-accent-foreground" : "transparent",
                  )}
                >
                  <route.icon className="mr-3 h-5 w-5" />
                  <span>{route.title}</span>
                </span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="border-t p-4">
          <div className="flex items-center gap-2 rounded-lg bg-muted p-4">
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">Pro Plan</p>
              <p className="text-xs text-muted-foreground">You are on the Pro plan</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

