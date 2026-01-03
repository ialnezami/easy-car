import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Admin routes - only admins can access
    if (pathname.startsWith("/admin")) {
      if (!token || token.role !== "admin") {
        return NextResponse.redirect(new URL("/auth/signin", req.url));
      }
      return NextResponse.next();
    }

    // Manager dashboard routes - only managers can access
    if (pathname.startsWith("/dashboard")) {
      if (!token || token.role !== "manager" || !token.agencyId) {
        // Redirect clients to their dashboard
        if (token?.role === "client") {
          return NextResponse.redirect(new URL("/client/dashboard", req.url));
        }
        // Redirect admins to admin dashboard
        if (token?.role === "admin") {
          return NextResponse.redirect(new URL("/admin", req.url));
        }
        return NextResponse.redirect(new URL("/auth/signin", req.url));
      }
      return NextResponse.next();
    }

    // Client dashboard routes - only clients can access
    if (pathname.startsWith("/client/dashboard")) {
      if (!token || token.role !== "client") {
        // Redirect managers to their dashboard
        if (token?.role === "manager") {
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }
        // Redirect admins to admin dashboard
        if (token?.role === "admin") {
          return NextResponse.redirect(new URL("/admin", req.url));
        }
        return NextResponse.redirect(new URL("/auth/signin", req.url));
      }
      return NextResponse.next();
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        
        // Protect admin routes
        if (pathname.startsWith("/admin")) {
          return !!token && token.role === "admin";
        }
        
        // Protect manager dashboard routes
        if (pathname.startsWith("/dashboard")) {
          return !!token && token.role === "manager" && !!token.agencyId;
        }
        
        // Protect client dashboard routes
        if (pathname.startsWith("/client/dashboard")) {
          return !!token && token.role === "client";
        }
        
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/client/dashboard/:path*"],
};


