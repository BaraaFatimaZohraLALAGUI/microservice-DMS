import type { User, LoginCredentials, SignupData, AuthResponse, UserResponse } from "./auth-types"
import Cookies from 'js-cookie'

// Cookie/storage keys
const CURRENT_USER_KEY = "dms_current_user"
const AUTH_TOKEN_KEY = "dms_auth_token"

// Cookie Options - 7 days expiry
const COOKIE_OPTIONS = { expires: 7, path: '/' }

// API URL configuration
// Using relative URL to avoid CORS issues
const API_BASE_URL = ""  // Empty string for relative URLs

/**
 * Get current user from cookie/local storage
 */
export const getCurrentUser = (): User | null => {
  if (typeof window === "undefined") return null

  const userJson = localStorage.getItem(CURRENT_USER_KEY)
  return userJson ? JSON.parse(userJson) : null
}

/**
 * Get stored authentication token
 */
export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null

  return localStorage.getItem(AUTH_TOKEN_KEY)
}

/**
 * Login user
 */
export const login = async (credentials: LoginCredentials): Promise<User> => {
  try {
    console.log('Login attempt for user:', credentials.username);

    // Get token using basic auth
    const auth = btoa(`${credentials.username}:${credentials.password}`)

    // We'll try our API proxy route first, then direct URLs
    const urls = [
      '/api/auth/token',                  // Use Next.js API route to proxy the request
      `${API_BASE_URL}/auth/token`,       // Try the relative URL 
      'http://localhost:8085/auth/token'  // Fallback to absolute URL
    ];

    let response = null;
    let lastError = null;

    // Try each URL until one works
    for (const url of urls) {
      try {
        console.log('Trying URL:', url);

        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          // Include credentials to ensure cookies are sent
          credentials: 'include',
          mode: 'cors',
          cache: 'no-cache'
        });

        console.log('Response from', url, '- status:', response.status);

        if (response.ok) {
          break; // Break out of the loop if successful
        } else {
          lastError = new Error(`Failed with status ${response.status}`);
        }
      } catch (err) {
        console.error('Fetch error for', url, ':', err);
        lastError = err;
      }
    }

    // If no successful response after trying all URLs
    if (!response || !response.ok) {
      throw lastError || new Error('Failed to connect to authentication server');
    }

    console.log('Response headers:', JSON.stringify(Array.from(response.headers.entries())));

    // Parse the response as JSON
    let authData: AuthResponse;
    try {
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      if (!responseText) {
        throw new Error('Empty response received');
      }

      authData = JSON.parse(responseText);
      console.log('Parsed auth data:', authData);
    } catch (err) {
      console.error('Failed to parse auth response:', err);
      throw new Error('Invalid response format from authentication server');
    }

    if (!authData.token) {
      console.error('No token in response:', authData);
      throw new Error('No authentication token received');
    }

    // Store the token
    localStorage.setItem(AUTH_TOKEN_KEY, authData.token)
    Cookies.set(AUTH_TOKEN_KEY, authData.token, COOKIE_OPTIONS)

    // Get user info using the token
    const userInfo = await getUserInfo(authData.token)
    console.log('User info:', userInfo);

    // Store user info
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userInfo))
    Cookies.set(CURRENT_USER_KEY, JSON.stringify(userInfo), COOKIE_OPTIONS)

    return userInfo
  } catch (error) {
    console.error('Login error:', error)
    throw new Error(error instanceof Error ? error.message : 'Authentication failed')
  }
}

/**
 * Get user info from token
 */
const getUserInfo = async (token: string): Promise<User> => {
  // In a real implementation, you would decode the JWT token or make an API call
  // to get the user's info. For now, we'll extract basic info from the token.

  // Decode JWT payload (middle part of the token)
  try {
    const payload = token.split('.')[1]
    const decodedPayload = JSON.parse(atob(payload))

    return {
      username: decodedPayload.sub || 'unknown',
      roles: decodedPayload.roles || ['ROLE_USER']
    }
  } catch (error) {
    console.error('Error decoding token:', error)
    throw new Error('Failed to get user information')
  }
}

/**
 * Register new user
 */
export const signup = async (data: SignupData): Promise<User> => {
  try {
    console.log('Signup attempt for user:', data.username);

    // We'll try our API proxy route first, then direct URLs
    const urls = [
      '/api/auth/signup',                  // Use Next.js API route to proxy the request (not implemented yet)
      `${API_BASE_URL}/auth/signup`,       // Try the relative URL
      'http://localhost:8085/auth/signup'  // Fallback to absolute URL
    ];

    let response = null;
    let lastError = null;

    // Try each URL until one works
    for (const url of urls) {
      try {
        console.log('Trying URL:', url);

        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            username: data.username,
            password: data.password
          }),
          credentials: 'include',
          mode: 'cors',
          cache: 'no-cache'
        });

        console.log('Response from', url, '- status:', response.status);

        if (response.ok) {
          break; // Break out of the loop if successful
        } else {
          const errorText = await response.text().catch(() => 'No error details');
          lastError = new Error(`Failed with status ${response.status}: ${errorText}`);
        }
      } catch (err) {
        console.error('Fetch error for', url, ':', err);
        lastError = err;
      }
    }

    // If no successful response after trying all URLs
    if (!response || !response.ok) {
      throw lastError || new Error('Failed to connect to registration server');
    }

    // Parse response
    let userData: UserResponse;
    try {
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      if (!responseText) {
        throw new Error('Empty response received');
      }

      userData = JSON.parse(responseText);
      console.log('Parsed user data:', userData);
    } catch (err) {
      console.error('Failed to parse signup response:', err);
      throw new Error('Invalid response format from registration server');
    }

    // After successful signup, automatically log in
    return await login({
      username: data.username,
      password: data.password
    })
  } catch (error) {
    console.error('Signup error:', error)
    throw new Error(error instanceof Error ? error.message : 'Registration failed')
  }
}

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
  // Remove stored auth data
  localStorage.removeItem(CURRENT_USER_KEY)
  localStorage.removeItem(AUTH_TOKEN_KEY)

  Cookies.remove(CURRENT_USER_KEY)
  Cookies.remove(AUTH_TOKEN_KEY)
}

/**
 * Check if user has admin role
 */
export const isAdmin = (user: User | null): boolean => {
  return user?.roles?.includes('ROLE_ADMIN') || false
}

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getAuthToken() && !!getCurrentUser()
}

/**
 * Get authorization header for API requests
 */
export const getAuthHeader = (): { Authorization: string } | {} => {
  const token = getAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

