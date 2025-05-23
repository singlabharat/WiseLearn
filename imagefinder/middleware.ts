import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // If the path looks like a learning HTML file, serve it directly
  if (pathname.startsWith("/learning_") && pathname.endsWith(".html")) {
    // This will be handled by the dynamic route
    return NextResponse.next()
  }

  return NextResponse.next()
}
