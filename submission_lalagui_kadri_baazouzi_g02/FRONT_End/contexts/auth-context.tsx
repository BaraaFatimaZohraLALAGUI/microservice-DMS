"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { AuthState, LoginCredentials, SignupData } from "@/lib/auth-types"
import { login, signup, logout, getCurrentUser, isAdmin, getAuthToken } from "@/lib/auth-service"

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  signup: (data: SignupData) => Promise<void>
  logout: () => Promise<void>
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter()
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    token: null
  })

  useEffect(() => {
    // Check if user is already logged in
    const user = getCurrentUser()
    const token = getAuthToken()

    setState({
      user,
      token,
      isAuthenticated: !!user && !!token,
      isLoading: false,
    })
  }, [])

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      const user = await login(credentials)
      setState({
        user,
        token: getAuthToken(),
        isAuthenticated: true,
        isLoading: false,
      })
      router.push("/")
    } catch (error) {
      throw error
    }
  }

  const handleSignup = async (data: SignupData) => {
    try {
      const user = await signup(data)
      setState({
        user,
        token: getAuthToken(),
        isAuthenticated: true,
        isLoading: false,
      })
      router.push("/")
    } catch (error) {
      throw error
    }
  }

  const handleLogout = async () => {
    await logout()
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    })
    router.push("/login")
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login: handleLogin,
        signup: handleSignup,
        logout: handleLogout,
        isAdmin: isAdmin(state.user),
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

