import { NextRequest, NextResponse } from 'next/server';

// Handle GET requests to fetch a specific department
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
        console.log(`Fetching department via API proxy: ${id}`);

        // Forward the request to the backend API
        const response = await fetch(`http://localhost:8085/api/v1/departments/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        console.log('Department fetch API response status:', response.status);

        // Get the response data
        const data = await response.json().catch(e => {
            console.error('Error parsing JSON response:', e);
            return { error: 'Invalid response from backend server' };
        });

        // Return the response from the backend
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Department fetch API proxy error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch department' },
            { status: 500 }
        );
    }
}

// Handle PUT requests to update a department
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
        const departmentData = await request.json();
        console.log(`Updating department via API proxy: ${id}`, departmentData);

        // Forward the request to the backend API
        const response = await fetch(`http://localhost:8085/api/v1/departments/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(departmentData)
        });

        console.log('Department update API response status:', response.status);

        // Get the response data
        const data = await response.json().catch(e => {
            console.error('Error parsing JSON response:', e);
            return { error: 'Invalid response from backend server' };
        });

        // Return the response from the backend
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Department update API proxy error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to update department' },
            { status: 500 }
        );
    }
}

// Handle DELETE requests to delete a department
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
        console.log(`Deleting department via API proxy: ${id}`);

        // Forward the request to the backend API
        const response = await fetch(`http://localhost:8085/api/v1/departments/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        console.log('Department deletion API response status:', response.status);

        // For DELETE operations, we might not have a JSON body in the response
        if (response.status === 204 || response.headers.get('content-length') === '0') {
            return new NextResponse(null, { status: 204 });
        }

        // Try to parse JSON response if available
        const data = await response.json().catch(e => {
            console.error('Error parsing JSON response:', e);
            // Still return success if the status is OK but no JSON
            if (response.ok) {
                return { message: 'Department deleted successfully' };
            }
            return { error: 'Invalid response from backend server' };
        });

        // Return the response from the backend
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Department deletion API proxy error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to delete department' },
            { status: 500 }
        );
    }
} 