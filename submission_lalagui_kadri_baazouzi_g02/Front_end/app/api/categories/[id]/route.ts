import { NextRequest, NextResponse } from 'next/server';

// Handle GET requests to fetch a specific category
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Extract token from the authorization header
        const authHeader = request.headers.get('Authorization');

        if (!authHeader) {
            return NextResponse.json(
                { error: 'Authorization header is required' },
                { status: 401 }
            );
        }

        const { id } = params;
        console.log(`Fetching category via API proxy: ${id}`);

        // Forward the request to the backend API
        const response = await fetch(`http://localhost:8085/api/v1/categories/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        console.log('Category fetch API response status:', response.status);

        // Get the response data
        const data = await response.json().catch(e => {
            console.error('Error parsing JSON response:', e);
            return { error: 'Invalid response from backend server' };
        });

        // Return the response from the backend
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Category fetch API proxy error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch category' },
            { status: 500 }
        );
    }
}

// Handle PUT requests to update a category
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Extract token from the authorization header
        const authHeader = request.headers.get('Authorization');

        if (!authHeader) {
            return NextResponse.json(
                { error: 'Authorization header is required' },
                { status: 401 }
            );
        }

        const { id } = params;
        // Parse the request body
        const categoryData = await request.json();
        console.log(`Updating category via API proxy: ${id}`, categoryData);

        // Forward the request to the backend API
        const response = await fetch(`http://localhost:8085/api/v1/categories/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(categoryData)
        });

        console.log('Category update API response status:', response.status);

        // Get the response data
        const data = await response.json().catch(e => {
            console.error('Error parsing JSON response:', e);
            return { error: 'Invalid response from backend server' };
        });

        // Return the response from the backend
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Category update API proxy error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to update category' },
            { status: 500 }
        );
    }
}

// Handle DELETE requests to delete a category
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Extract token from the authorization header
        const authHeader = request.headers.get('Authorization');

        if (!authHeader) {
            return NextResponse.json(
                { error: 'Authorization header is required' },
                { status: 401 }
            );
        }

        const { id } = params;
        console.log(`Deleting category via API proxy: ${id}`);

        // Forward the request to the backend API
        const response = await fetch(`http://localhost:8085/api/v1/categories/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        console.log('Category deletion API response status:', response.status);

        // For DELETE operations, we might not have a JSON body in the response
        if (response.status === 204 || response.headers.get('content-length') === '0') {
            return new NextResponse(null, { status: 204 });
        }

        // Try to parse JSON response if available
        const data = await response.json().catch(e => {
            console.error('Error parsing JSON response:', e);
            // Still return success if the status is OK but no JSON
            if (response.ok) {
                return { message: 'Category deleted successfully' };
            }
            return { error: 'Invalid response from backend server' };
        });

        // Return the response from the backend
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Category deletion API proxy error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to delete category' },
            { status: 500 }
        );
    }
} 