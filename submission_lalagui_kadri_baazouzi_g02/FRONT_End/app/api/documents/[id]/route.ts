import { NextRequest, NextResponse } from 'next/server';

// Helper function to get auth header from request
const getAuthHeader = (request: NextRequest) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
        return null;
    }
    return authHeader;
};

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;

        const authHeader = getAuthHeader(request);
        if (!authHeader) {
            return NextResponse.json(
                { error: 'Authorization header is required' },
                { status: 401 }
            );
        }

        console.log(`Fetching document with ID ${id} via API proxy`);

        // Based on documentation: GET /api/v1/documents/{id}
        const response = await fetch(`http://localhost:8085/api/v1/documents/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        console.log('Document detail API response status:', response.status);

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Document not found or access denied' },
                { status: response.status }
            );
        }

        const data = await response.json().catch(e => {
            console.error('Error parsing JSON response:', e);
            return { error: 'Invalid response from document service' };
        });

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Document detail API proxy error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch document' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;

        const authHeader = getAuthHeader(request);
        if (!authHeader) {
            return NextResponse.json(
                { error: 'Authorization header is required' },
                { status: 401 }
            );
        }

        console.log(`Deleting document with ID ${id} via API proxy`);

        // Based on documentation: DELETE /api/v1/documents/{id}
        const response = await fetch(`http://localhost:8085/api/v1/documents/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        console.log('Document deletion API response status:', response.status);

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Document not found or access denied' },
                { status: response.status }
            );
        }

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('Document deletion API proxy error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to delete document' },
            { status: 500 }
        );
    }
} 