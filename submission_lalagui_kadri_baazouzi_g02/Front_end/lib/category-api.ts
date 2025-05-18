import { getAuthHeader } from './auth-service';

// API Base URL - using Next.js API proxy
const API_BASE_URL = '/api';

// Category interface
export interface Category {
    id?: number;
    name: string;
}

/**
 * Get all categories
 */
export async function getAllCategories(): Promise<Category[]> {
    try {
        console.log('Fetching all categories');

        const response = await fetch(`${API_BASE_URL}/categories`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            }
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'No error details');
            console.error(`Failed to fetch categories: ${response.status}`, errorText);
            throw new Error(`Failed to fetch categories: ${response.status}`);
        }

        const data = await response.json();
        console.log('Categories fetched:', data);
        return data;
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to load categories');
    }
}

/**
 * Get a category by ID
 */
export async function getCategoryById(id: number): Promise<Category> {
    try {
        console.log(`Fetching category with ID: ${id}`);

        const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            }
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'No error details');
            console.error(`Failed to fetch category: ${response.status}`, errorText);
            throw new Error(`Failed to fetch category: ${response.status}`);
        }

        const data = await response.json();
        console.log('Category fetched:', data);
        return data;
    } catch (error) {
        console.error(`Error fetching category with ID ${id}:`, error);
        throw new Error(error instanceof Error ? error.message : 'Failed to load category');
    }
}

/**
 * Create a new category
 */
export async function createCategory(category: Category): Promise<Category> {
    try {
        console.log('Creating category:', category);

        const response = await fetch(`${API_BASE_URL}/categories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(category)
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'No error details');
            console.error(`Failed to create category: ${response.status}`, errorText);
            throw new Error(`Failed to create category: ${response.status}`);
        }

        const data = await response.json();
        console.log('Category created:', data);
        return data;
    } catch (error) {
        console.error('Error creating category:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to create category');
    }
}

/**
 * Update a category
 */
export async function updateCategory(id: number, category: Category): Promise<Category> {
    try {
        console.log(`Updating category ${id}:`, category);

        const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(category)
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'No error details');
            console.error(`Failed to update category: ${response.status}`, errorText);
            throw new Error(`Failed to update category: ${response.status}`);
        }

        const data = await response.json();
        console.log('Category updated:', data);
        return data;
    } catch (error) {
        console.error(`Error updating category with ID ${id}:`, error);
        throw new Error(error instanceof Error ? error.message : 'Failed to update category');
    }
}

/**
 * Delete a category
 */
export async function deleteCategory(id: number): Promise<void> {
    try {
        console.log(`Deleting category with ID: ${id}`);

        const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            }
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'No error details');
            console.error(`Failed to delete category: ${response.status}`, errorText);
            throw new Error(`Failed to delete category: ${response.status}`);
        }

        console.log('Category deleted successfully');
    } catch (error) {
        console.error(`Error deleting category with ID ${id}:`, error);
        throw new Error(error instanceof Error ? error.message : 'Failed to delete category');
    }
} 