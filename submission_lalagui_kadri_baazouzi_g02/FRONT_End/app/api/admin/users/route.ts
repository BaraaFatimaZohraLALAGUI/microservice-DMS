import { NextRequest, NextResponse } from 'next/server';

// Handle GET requests to fetch all users
export async function GET(request: NextRequest) {
    try {
        // Extract token from the authorization header
        const authHeader = request.headers.get('Authorization');

        if (!authHeader) {
            return NextResponse.json(
                { error: 'Authorization header is required' },
                { status: 401 }
            );
        }

        console.log('Fetching users via API proxy');

        // Forward the request to the backend API using the new path
        const response = await fetch('http://localhost:8085/api/admin/users', {
            method: 'GET',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        console.log('Users API response status:', response.status);

        // Get the response data
        const data = await response.json().catch(e => {
            console.error('Error parsing JSON response:', e);
            return { error: 'Invalid response from backend server' };
        });

        // Return the response from the backend
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Users API proxy error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch users' },
            { status: 500 }
        );
    }
}

// Handle POST requests to create a user
export async function POST(request: NextRequest) {
    try {
        // Extract token from the authorization header
        const authHeader = request.headers.get('Authorization');

        if (!authHeader) {
            return NextResponse.json(
                { error: 'Authorization header is required' },
                { status: 401 }
            );
        }

        // Parse the request body
        const userData = await request.json();
        console.log('Creating user via API proxy:', userData);

        // Forward the request to the backend API using the new path
        const response = await fetch('http://localhost:8085/api/admin/users', {
            method: 'POST',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        console.log('User creation API response status:', response.status);

        // Get the response data and log any error details
        let data;
        try {
            const responseText = await response.text();
            console.log('Raw response from backend:', responseText);

            data = responseText ? JSON.parse(responseText) : { error: 'Empty response' };
        } catch (e) {
            console.error('Error parsing JSON response:', e);
            data = { error: 'Invalid response from backend server' };
        }

        // Return the response from the backend
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('User creation API proxy error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to create user' },
            { status: 500 }
        );
    }
} 