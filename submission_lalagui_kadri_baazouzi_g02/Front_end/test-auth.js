// Test script for authentication endpoint
// Run with: node test-auth.js

// Change to fetch for browser or node-fetch for Node.js
const fetch = require('node-fetch');

async function testAuth() {
    const API_BASE_URL = "http://localhost:8085";
    const username = "admin";
    const password = "adminpassword";

    try {
        console.log(`Testing auth with ${username}:${password}`);

        // Basic auth header
        const auth = Buffer.from(`${username}:${password}`).toString('base64');

        console.log('Sending request to:', `${API_BASE_URL}/auth/token`);

        const response = await fetch(`${API_BASE_URL}/auth/token`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            // Include credentials to ensure cookies are sent
            credentials: 'include',
        });

        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);

        // Get response headers
        const headers = {};
        response.headers.forEach((value, name) => {
            headers[name] = value;
        });
        console.log('Response headers:', headers);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error details:', errorText);
            return;
        }

        // Read the response
        const responseText = await response.text();
        console.log('Raw response:', responseText);

        if (responseText) {
            try {
                const data = JSON.parse(responseText);
                console.log('Parsed data:', data);
            } catch (err) {
                console.error('Failed to parse response as JSON:', err);
            }
        } else {
            console.log('Empty response received');
        }

    } catch (error) {
        console.error('Test error:', error);
    }
}

testAuth(); 