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
    { params }: { params: { s3FileKey: string } }
) {
    try {
        // URL-decode the s3FileKey parameter
        const s3FileKey = decodeURIComponent(params.s3FileKey);

        const authHeader = getAuthHeader(request);
        if (!authHeader) {
            return NextResponse.json(
                { error: 'Authorization header is required' },
                { status: 401 }
            );
        }

        const response = await fetch(`http://localhost:8085/api/v1/storage/presigned-url/${encodeURIComponent(s3FileKey)}`, {
            method: 'GET',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        const data = await response.json().catch(e => {
            console.error('Error parsing JSON response:', e);
            return { error: 'Invalid response from storage service' };
        });

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Storage API proxy error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to get presigned URL' },
            { status: 500 }
        );
    }
} 