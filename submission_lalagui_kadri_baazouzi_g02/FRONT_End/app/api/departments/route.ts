import { NextRequest, NextResponse } from 'next/server';

// Helper function to get auth header from request
const getAuthHeader = (request: NextRequest) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
        return null;
    }
    return authHeader;
};

// Handle GET requests to fetch all departments
export async function GET(request: NextRequest) {
    try {
        const authHeader = getAuthHeader(request);
        if (!authHeader) {
            return NextResponse.json(
                { error: 'Authorization header is required' },
                { status: 401 }
            );
        }

        console.log('Fetching departments via API proxy');

        // Forward the request to the backend API
        const response = await fetch('http://localhost:8085/api/v1/departments', {
            method: 'GET',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        console.log('Departments API response status:', response.status);

        // Get the response data
        const data = await response.json().catch(e => {
            console.error('Error parsing JSON response:', e);
            return { error: 'Invalid response from departments service' };
        });

        // Return the response from the backend
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Departments API proxy error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch departments' },
            { status: 500 }
        );
    }
}

// Handle POST requests to create a department
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
        const departmentData = await request.json();
        console.log('Creating department via API proxy:', departmentData.name);

        // Forward the request to the backend API
        const response = await fetch('http://localhost:8085/api/v1/departments', {
            method: 'POST',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(departmentData)
        });

        console.log('Department creation API response status:', response.status);

        // Get the response data
        const data = await response.json().catch(e => {
            console.error('Error parsing JSON response:', e);
            return { error: 'Invalid response from backend server' };
        });

        // Return the response from the backend
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Department creation API proxy error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to create department' },
            { status: 500 }
        );
    }
} 