export type UserRole = "ROLE_ADMIN" | "ROLE_USER"

export interface User {
  id?: string
  username: string
  roles: UserRole[]
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  token: string | null
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface SignupData {
  username: string
  password: string
  confirmPassword?: string
}

export interface AuthResponse {
  token: string
}

export interface UserResponse {
  username: string
  roles: UserRole[]
}

