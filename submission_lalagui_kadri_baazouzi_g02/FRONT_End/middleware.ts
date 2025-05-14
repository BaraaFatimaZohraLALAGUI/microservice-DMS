import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const authToken = request.cookies.get("dms_auth_token")
  const isLoggedIn = !!authToken

  // Define public routes that don't require authentication
  const publicRoutes = ["/login", "/signup"]
  const isPublicRoute = publicRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  // Redirect to login if not logged in and trying to access a protected route
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Redirect to dashboard if logged in and trying to access login/signup
  if (isLoggedIn && isPublicRoute) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

