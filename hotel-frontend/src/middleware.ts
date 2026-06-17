import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Protect dashboard routes
  if (path.startsWith("/dashboard")) {
    const token = request.cookies.get("token")?.value;
    const userRole = request.cookies.get("user-role")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Role verification mappings
    if (path.startsWith("/dashboard/partner") && userRole !== "HOTEL_PARTNER") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    if (path.startsWith("/dashboard/admin") && userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    if (path.startsWith("/dashboard/customer") && userRole !== "CUSTOMER") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
