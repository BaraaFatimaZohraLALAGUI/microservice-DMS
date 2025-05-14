import { getAuthHeader } from './auth-service';

// API Base URL - using Next.js API proxy to avoid CORS issues
const API_BASE_URL = '/api';

// Enhanced User interface to match API responses with profile data
export interface User {
    username: string;
    roles: string[];
    // Profile fields
    name?: string;
    email?: string;
    phone?: string;
    position?: string;
    department?: string;
    status?: string;
    address?: string;
    hireDate?: Date;
    employeeId?: number;
}

// Interface for creating a user with both auth and profile data
export interface CreateUserData {
    username: string;
    password: string;
    name?: string;
    email?: string;
    phone?: string;
    position?: string;
    department?: string;
    status?: string;
    address?: string;
    hireDate?: Date;
    employeeId?: number;
}

// Interface for updating a user
export interface UpdateUserData {
    password?: string;
    name?: string;
    email?: string;
    phone?: string;
    position?: string;
    department?: string;
    status?: string;
    address?: string;
    hireDate?: Date;
    employeeId?: number;
}

/**
 * Get all users
 */
export async function getAllUsers(): Promise<User[]> {
    try {
        console.log('Fetching all users');

        const response = await fetch(`${API_BASE_URL}/admin/users`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            }
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'No error details');
            console.error(`Failed to fetch users: ${response.status}`, errorText);
            throw new Error(`Failed to fetch users: ${response.status}`);
        }

        const data = await response.json();
        console.log('Users fetched:', data);
        return data;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to load users');
    }
}

/**
 * Get a user by username
 */
export async function getUserByUsername(username: string): Promise<User> {
    try {
        console.log(`Fetching user with username: ${username}`);

        const response = await fetch(`${API_BASE_URL}/admin/users/${username}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            }
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'No error details');
            console.error(`Failed to fetch user: ${response.status}`, errorText);
            throw new Error(`Failed to fetch user: ${response.status}`);
        }

        const data = await response.json();
        console.log('User fetched:', data);
        return data;
    } catch (error) {
        console.error(`Error fetching user with username ${username}:`, error);
        throw new Error(error instanceof Error ? error.message : 'Failed to load user');
    }
}

/**
 * Create a new user (admin only) with profile information
 */
export async function createUser(userData: CreateUserData): Promise<User> {
    try {
        console.log('Creating user:', userData.username);

        // Prepare the complete request with roles and all profile data
        const requestData = {
            ...userData,
            roles: ["ROLE_USER"] // Default role for new users
        };

        const response = await fetch(`${API_BASE_URL}/admin/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'No error details');
            console.error(`Failed to create user: ${response.status}`, errorText);
            throw new Error(`Failed to create user: ${response.status}`);
        }

        const data = await response.json();
        console.log('User created:', data);
        return data;
    } catch (error) {
        console.error('Error creating user:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to create user');
    }
}

/**
 * Update a user (admin only) with profile information
 */
export async function updateUser(username: string, updates: UpdateUserData): Promise<User> {
    try {
        console.log(`Updating user ${username}`, updates);

        // Don't explicitly set roles to undefined, just send the updates as is
        const response = await fetch(`${API_BASE_URL}/admin/users/${username}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(updates)
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'No error details');
            console.error(`Failed to update user: ${response.status}`, errorText);
            throw new Error(`Failed to update user: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('User updated:', data);
        return data;
    } catch (error) {
        console.error(`Error updating user ${username}:`, error);
        throw new Error(error instanceof Error ? error.message : 'Failed to update user');
    }
}

/**
 * Delete a user (admin only)
 */
export async function deleteUser(username: string): Promise<void> {
    try {
        console.log(`Deleting user: ${username}`);

        const response = await fetch(`${API_BASE_URL}/admin/users/${username}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            }
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'No error details');
            console.error(`Failed to delete user: ${response.status}`, errorText);
            throw new Error(`Failed to delete user: ${response.status}`);
        }

        console.log('User deleted successfully');
    } catch (error) {
        console.error(`Error deleting user ${username}:`, error);
        throw new Error(error instanceof Error ? error.message : 'Failed to delete user');
    }
} 