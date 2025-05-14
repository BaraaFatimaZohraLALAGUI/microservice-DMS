import { NextRequest, NextResponse } from 'next/server';

// Helper function to get auth header from request
const getAuthHeader = (request: NextRequest) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
        return null;
    }
    return authHeader;
};

export async function POST(request: NextRequest) {
    try {
        const authHeader = getAuthHeader(request);
        if (!authHeader) {
            return NextResponse.json(
                { error: 'Authorization header is required' },
                { status: 401 }
            );
        }

        // Clone the request so we can read the body
        const reqClone = request.clone();

        // Forward the multipart/form-data to the storage service
        const response = await fetch('http://localhost:8085/api/v1/storage/upload/', {
            method: 'POST',
            headers: {
                'Authorization': authHeader,
                // Don't set Content-Type here as it will be set automatically for multipart/form-data
            },
            body: await reqClone.formData()
        });

        // Parse response
        const data = await response.json().catch(e => {
            console.error('Error parsing JSON response:', e);
            return { error: 'Invalid response from storage service' };
        });

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Storage API proxy error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to upload file' },
            { status: 500 }
        );
    }
} 