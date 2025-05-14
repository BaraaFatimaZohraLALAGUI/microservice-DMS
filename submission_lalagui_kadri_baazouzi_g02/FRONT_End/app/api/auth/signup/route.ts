import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        // Parse the request body
        const userData = await request.json();
        console.log('Creating user via API signup proxy:', userData.username);

        // Forward the request to the backend API
        const response = await fetch('http://localhost:8085/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        console.log('User signup API response status:', response.status);

        // Get the response data
        const data = await response.json().catch(e => {
            console.error('Error parsing JSON response:', e);
            return { error: 'Invalid response from backend server' };
        });

        // Return the response from the backend
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('User signup API proxy error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to create user' },
            { status: 500 }
        );
    }
} 