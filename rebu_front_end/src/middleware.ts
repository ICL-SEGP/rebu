import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: "83e9b797df942c9769653bee15485beca10a6d2a8ec296b420a36841a3cf9462" });
  const { pathname } = req.nextUrl;

  console.log(pathname)

  console.log(pathname.startsWith("/api"))


  // // Allow users to access these public pages without authentication
  // const publicRoutes = ["/auth", "/public", "/api"];

  // // ✅ Allow access to public routes without a token
  // if (publicRoutes.some(route => pathname.startsWith(route))) {
  //   return NextResponse.next();
  // }

  // 🔹 If no token (user is not authenticated), redirect them to login
  // if (!token) {
  //   return NextResponse.redirect(new URL("/auth/login", req.url));
  // }

  if (pathname.startsWith("/user") && !token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (pathname.startsWith("/admin") && !token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (pathname.startsWith("/user") && token?.role !== "user") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 🔹 If the user is NOT an admin & tries to access `/admin/*`, redirect them to home
  if (pathname.startsWith("/admin") && token.role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // ✅ Allow authenticated users to proceed
  return NextResponse.next();
}

// **Apply middleware to all routes**
export const config = {
  matcher: "/:path*",
};