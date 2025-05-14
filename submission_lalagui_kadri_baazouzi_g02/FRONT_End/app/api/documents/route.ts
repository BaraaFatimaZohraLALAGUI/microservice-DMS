import { NextRequest, NextResponse } from 'next/server';

// Helper function to get auth header from request
const getAuthHeader = (request: NextRequest) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
        return null;
    }
    return authHeader;
};

export async function GET(request: NextRequest) {
    try {
        const authHeader = getAuthHeader(request);
        if (!authHeader) {
            return NextResponse.json(
                { error: 'Authorization header is required' },
                { status: 401 }
            );
        }

        // Based on the documentation, there's no pagination or query parameters for listing documents
        // Just a simple endpoint: GET /api/v1/documents
        const url = 'http://localhost:8085/api/v1/documents';

        console.log('Fetching documents via API proxy');

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        console.log('Documents API response status:', response.status);

        const data = await response.json().catch(e => {
            console.error('Error parsing JSON response:', e);
            return { error: 'Invalid response from document service' };
        });

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Document API proxy error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch documents' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const authHeader = getAuthHeader(request);
        if (!authHeader) {
            return NextResponse.json(
                { error: 'Authorization header is required' },
                { status: 401 }
            );
        }

        // Parse the document data from the request body
        const documentData = await request.json();
        console.log('Creating document via API proxy:', documentData);

        const response = await fetch('http://localhost:8085/api/v1/documents', {
            method: 'POST',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(documentData)
        });

        console.log('Document creation API response status:', response.status);

        const data = await response.json().catch(e => {
            console.error('Error parsing JSON response:', e);
            return { error: 'Invalid response from document service' };
        });

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Document API proxy error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to create document' },
            { status: 500 }
        );
    }
} 