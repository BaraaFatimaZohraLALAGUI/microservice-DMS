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

        // Direct URL first, then try gateway URLs
        const urls = [
            'http://localhost:8082/admin/users',  // Direct to auth service
            'http://localhost:8085/admin/users',  // Gateway direct 
            `/admin/users`,                       // Gateway relative
            `${API_BASE_URL}/admin/users`         // API proxy URL
        ];

        let response = null;
        let lastError = null;

        // Try each URL until one works
        for (const url of urls) {
            try {
                console.log('Trying URL for getAllUsers:', url);

                response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        ...getAuthHeader()
                    },
                    credentials: 'include' // Include credentials
                });

                console.log('Response from', url, '- status:', response.status);

                // Log full response text
                const responseText = await response.text();
                console.log('Response text:', responseText);

                // If empty response, continue to next URL
                if (!responseText) {
                    console.warn('Empty response, trying next URL');
                    continue;
                }

                // Try to parse the response
                try {
                    const data = JSON.parse(responseText);
                    console.log('Parsed data:', data);
                    return data;
                } catch (parseError) {
                    console.error('Error parsing response:', parseError);
                    // Continue to next URL if parse fails
                }
            } catch (err) {
                console.error('Fetch error for', url, ':', err);
                lastError = err;
            }
        }

        // If we get here, all URLs failed
        throw lastError || new Error('Failed to fetch users from any endpoint');
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error; // Propagate the error
    }
}

/**
 * Get a user by username
 */
export async function getUserByUsername(username: string): Promise<User> {
    try {
        console.log(`Fetching user with username: ${username}`);

        // Direct URL first, then try gateway URLs
        const urls = [
            `http://localhost:8082/admin/users/${username}`,  // Direct to auth service
            `http://localhost:8085/admin/users/${username}`,  // Gateway direct
            `/admin/users/${username}`,                       // Gateway relative
            `${API_BASE_URL}/admin/users/${username}`         // API proxy URL
        ];

        let lastError = null;

        // Try each URL until one works
        for (const url of urls) {
            try {
                console.log('Trying URL for getUserByUsername:', url);

                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        ...getAuthHeader()
                    },
                    credentials: 'include' // Include credentials
                });

                console.log('Response from', url, '- status:', response.status);

                // Log full response text
                const responseText = await response.text();
                console.log('Response text:', responseText);

                // If empty response, continue to next URL
                if (!responseText) {
                    console.warn('Empty response, trying next URL');
                    continue;
                }

                // Try to parse the response
                try {
                    const data = JSON.parse(responseText);
                    console.log('Parsed data:', data);
                    return data;
                } catch (parseError) {
                    console.error('Error parsing response:', parseError);
                    // Continue to next URL if parse fails
                }
            } catch (err) {
                console.error('Fetch error for', url, ':', err);
                lastError = err;
            }
        }

        // If we get here, all URLs failed
        throw lastError || new Error(`Failed to fetch user ${username} from any endpoint`);
    } catch (error) {
        console.error(`Error fetching user with username ${username}:`, error);
        throw error; // Propagate the error
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