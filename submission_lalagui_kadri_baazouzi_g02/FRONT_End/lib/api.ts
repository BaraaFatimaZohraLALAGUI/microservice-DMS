// API service for interacting with the Flask backend

export interface User {
  id: number
  name: string
  position: string
  address: string
  status: string
  email: string
  phone: string
  department: string
  hire_date: string
  employee_id: number
}

export interface PaginationInfo {
  total_records: number
  total_pages: number
  current_page: number
  per_page: number
  has_next: boolean
  has_prev: boolean
}

export interface SortInfo {
  sort_by: string
  order: "asc" | "desc"
}

export interface FilterItem {
  key: string
  op: "eq" | "ne" | "gt" | "lt" | "ge" | "le" | "contains" | "startswith" | "endswith" | "in"
  value: string | number | boolean | string[] | number[]
}

export interface UsersResponse {
  status: string
  data: User[]
  pagination: PaginationInfo
  sort: SortInfo
  filters: FilterItem[]
}

const API_BASE_URL = "http://localhost:5000/api"

export async function getUsers(
  page = 1,
  perPage = 10,
  sortBy = "id",
  order: "asc" | "desc" = "asc",
  filters: FilterItem[] = [],
): Promise<UsersResponse> {
  const url = new URL(`${API_BASE_URL}/users`)
  url.searchParams.append("page", page.toString())
  url.searchParams.append("per_page", perPage.toString())
  url.searchParams.append("sort_by", sortBy)
  url.searchParams.append("order", order)

  if (filters.length > 0) {
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(filters),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return response.json()
  } else {
    const response = await fetch(url.toString())

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return response.json()
  }
}

export async function getUserById(id: number): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/user`)

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  const data = await response.json()
  return data.data
}

export async function createUser(userData: Omit<User, "id">): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  const data = await response.json()
  return data.data
}

export async function updateUser(id: number, userData: Partial<User>): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  const data = await response.json()
  return data.data
}

export async function deleteUser(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }
}

