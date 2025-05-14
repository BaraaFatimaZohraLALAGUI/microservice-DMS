import { NextRequest, NextResponse } from 'next/server';

// Handle DELETE requests to delete a user
export async function DELETE(
    request: NextRequest,
    { params }: { params: { username: string } }
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

        // Properly extract the username
        const { username } = params;
        console.log(`Deleting user via API proxy: ${username}`);

        // Forward the request to the backend API using the new path
        const response = await fetch(`http://localhost:8085/api/admin/users/${username}`, {
            method: 'DELETE',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        console.log('User deletion API response status:', response.status);

        // For DELETE operations, we might not have a JSON body in the response
        if (response.status === 204 || response.headers.get('content-length') === '0') {
            return new NextResponse(null, { status: 204 });
        }

        // Try to parse JSON response if available
        const data = await response.json().catch(e => {
            console.error('Error parsing JSON response:', e);
            // Still return success if the status is OK but no JSON
            if (response.ok) {
                return { message: 'User deleted successfully' };
            }
            return { error: 'Invalid response from backend server' };
        });

        // Return the response from the backend
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('User deletion API proxy error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to delete user' },
            { status: 500 }
        );
    }
}

// Handle PUT requests to update a user
export async function PUT(
    request: NextRequest,
    { params }: { params: { username: string } }
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

        // Properly extract the username
        const { username } = params;

        // Parse the request body
        const userData = await request.json();
        console.log(`Updating user via API proxy: ${username}`, userData);

        // Forward the request to the backend API using the new path
        const response = await fetch(`http://localhost:8085/api/admin/users/${username}`, {
            method: 'PUT',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        console.log('User update API response status:', response.status);

        // Check if the response has content before trying to parse it
        if (response.status === 204 || response.headers.get('content-length') === '0') {
            return new NextResponse(null, { status: 204 });
        }

        // Get the response body text for debugging
        const responseText = await response.text();
        console.log('Response body:', responseText);

        // Try to parse the response JSON if it exists
        let data;
        try {
            if (responseText.trim()) {
                data = JSON.parse(responseText);
            } else {
                data = { message: 'User updated successfully' };
            }
        } catch (e) {
            console.error('Error parsing JSON response:', e);
            // Show more details about the error in the response
            return NextResponse.json(
                {
                    error: 'Invalid response from backend server',
                    details: responseText,
                    status: response.status,
                    statusText: response.statusText
                },
                { status: 500 }
            );
        }

        // Return the response from the backend with the same status
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('User update API proxy error:', error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Failed to update user',
                stack: error instanceof Error ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}

// Handle GET requests to fetch a specific user
export async function GET(
    request: NextRequest,
    { params }: { params: { username: string } }
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

        // Properly extract the username
        const { username } = params;
        console.log(`Fetching user via API proxy: ${username}`);

        // Forward the request to the backend API using the new path
        const response = await fetch(`http://localhost:8085/api/admin/users/${username}`, {
            method: 'GET',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        console.log('User fetch API response status:', response.status);

        // Get the response data
        const data = await response.json().catch(e => {
            console.error('Error parsing JSON response:', e);
            return { error: 'Invalid response from backend server' };
        });

        // Return the response from the backend
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('User fetch API proxy error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch user' },
            { status: 500 }
        );
    }
} 