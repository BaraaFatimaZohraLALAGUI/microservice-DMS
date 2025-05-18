import { getAuthHeader } from './auth-service';

// API Base URL - using Next.js API proxy
const API_BASE_URL = '/api';

// Department interface
export interface Department {
    id?: number;
    name: string;
}

// Department User Assignment interface
export interface DepartmentUserAssignment {
    userId: string;
}

/**
 * Get all departments from the API
 */
export async function getAllDepartments(): Promise<Department[]> {
    try {
        console.log('Fetching all departments');

        const response = await fetch(`${API_BASE_URL}/departments`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            }
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'No error details');
            console.error(`Failed to fetch departments: ${response.status}`, errorText);
            throw new Error(`Failed to fetch departments: ${response.status}`);
        }

        const data = await response.json();
        console.log('Departments fetched:', data);
        return data;
    } catch (error) {
        console.error('Error fetching departments:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to load departments');
    }
}

/**
 * Get a department by ID
 */
export async function getDepartmentById(id: number): Promise<Department> {
    try {
        console.log(`Fetching department with ID: ${id}`);

        const response = await fetch(`${API_BASE_URL}/departments/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            }
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'No error details');
            console.error(`Failed to fetch department: ${response.status}`, errorText);
            throw new Error(`Failed to fetch department: ${response.status}`);
        }

        const data = await response.json();
        console.log('Department fetched:', data);
        return data;
    } catch (error) {
        console.error(`Error fetching department with ID ${id}:`, error);
        throw new Error(error instanceof Error ? error.message : 'Failed to load department');
    }
}

/**
 * Create a new department
 */
export async function createDepartment(department: Department): Promise<Department> {
    try {
        console.log('Creating department:', department);

        const response = await fetch(`${API_BASE_URL}/departments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(department)
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'No error details');
            console.error(`Failed to create department: ${response.status}`, errorText);
            throw new Error(`Failed to create department: ${response.status}`);
        }

        const data = await response.json();
        console.log('Department created:', data);
        return data;
    } catch (error) {
        console.error('Error creating department:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to create department');
    }
}

/**
 * Update a department
 */
export async function updateDepartment(id: number, department: Department): Promise<Department> {
    try {
        console.log(`Updating department ${id}:`, department);

        const response = await fetch(`${API_BASE_URL}/departments/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(department)
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'No error details');
            console.error(`Failed to update department: ${response.status}`, errorText);
            throw new Error(`Failed to update department: ${response.status}`);
        }

        const data = await response.json();
        console.log('Department updated:', data);
        return data;
    } catch (error) {
        console.error(`Error updating department with ID ${id}:`, error);
        throw new Error(error instanceof Error ? error.message : 'Failed to update department');
    }
}

/**
 * Delete a department
 */
export async function deleteDepartment(id: number): Promise<void> {
    try {
        console.log(`Deleting department with ID: ${id}`);

        const response = await fetch(`${API_BASE_URL}/departments/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            }
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'No error details');
            console.error(`Failed to delete department: ${response.status}`, errorText);
            throw new Error(`Failed to delete department: ${response.status}`);
        }

        console.log('Department deleted successfully');
    } catch (error) {
        console.error(`Error deleting department with ID ${id}:`, error);
        throw new Error(error instanceof Error ? error.message : 'Failed to delete department');
    }
}

/**
 * Assign a user to a department
 */
export async function assignUserToDepartment(departmentId: number, userId: string): Promise<void> {
    try {
        console.log(`Assigning user ${userId} to department ${departmentId}`);

        const response = await fetch(`${API_BASE_URL}/departments/${departmentId}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify({ userId })
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'No error details');
            console.error(`Failed to assign user to department: ${response.status}`, errorText);
            throw new Error(`Failed to assign user to department: ${response.status}`);
        }

        console.log('User assigned to department successfully');
    } catch (error) {
        console.error(`Error assigning user ${userId} to department ${departmentId}:`, error);
        throw new Error(error instanceof Error ? error.message : 'Failed to assign user to department');
    }
}

/**
 * Remove a user from a department
 */
export async function removeUserFromDepartment(departmentId: number, userId: string): Promise<void> {
    try {
        console.log(`Removing user ${userId} from department ${departmentId}`);

        const response = await fetch(`${API_BASE_URL}/departments/${departmentId}/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            }
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'No error details');
            console.error(`Failed to remove user from department: ${response.status}`, errorText);
            throw new Error(`Failed to remove user from department: ${response.status}`);
        }

        console.log('User removed from department successfully');
    } catch (error) {
        console.error(`Error removing user ${userId} from department ${departmentId}:`, error);
        throw new Error(error instanceof Error ? error.message : 'Failed to remove user from department');
    }
} 