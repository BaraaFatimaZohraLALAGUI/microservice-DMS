import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
import { AuthProvider } from "@/contexts/auth-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Document Management System",
  description: "Professional Document Management System",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <div className="flex h-screen overflow-hidden">
              <Sidebar />
              <div className="flex flex-col flex-1 overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 p-4 md:p-6">{children}</main>
              </div>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'