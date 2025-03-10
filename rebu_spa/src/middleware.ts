import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { getSession } from "next-auth/react";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  // const session = await getSession();

  // const { pathname } = req.nextUrl;

  // if (
  //   pathname.startsWith("/_next/") || // Static assets (CSS, JS, etc.)
  //   pathname.startsWith("/api/") || // API routes (e.g., /api/auth/session)
  //   pathname === "/favicon.ico"
  // ) {
  //   return NextResponse.next();
  // }

  // if (
  //   (pathname.startsWith("/sign-in") || pathname.startsWith("/register")) &&
  //   !token
  // ) {
  //   console.log("✅ Allowing access to /sign-in");
  //   return NextResponse.next();
  // }

  // if (!token) {
  //   console.log("🔄 Redirecting to /sign-in because user is not authenticated");
  //   return NextResponse.redirect(new URL("/sign-in", req.url));
  // }

  // if (pathname.startsWith("/user") && token?.user.role !== "user") {
  //   console.log("✅ User is authenticated, allowing request");
  //   return NextResponse.redirect(new URL("/", req.url));
  // }

  // // 🔹 If the user is NOT an affiliate & tries to access `/affiliate/*`, redirect them to home
  // if (pathname.startsWith("/affiliate") && token?.user.role !== "affiliate") {
  //   console.log("🛂 affiliate is authenticated");
  //   return NextResponse.redirect(new URL("/", req.url));
  // }

  // ✅ Allow authenticated users to proceed
  console.log("✅ User is authenticated, but no specific match in middleware");
  return NextResponse.next();
}

// export async function middleware(req: NextRequest) {
//   // const token = await getToken({ req });
//   const session = await getSession();

//   const { pathname } = req.nextUrl;

//   if (
//     pathname.startsWith("/_next/") || // Static assets (CSS, JS, etc.)
//     pathname.startsWith("/api/") || // API routes (e.g., /api/auth/session)
//     pathname === "/favicon.ico"
//   ) {
//     return NextResponse.next();
//   }

//   if (
//     (pathname.startsWith("/sign-in") || pathname.startsWith("/register")) &&
//     !session?.accessToken
//   ) {
//     console.log("✅ Allowing access to /sign-in");
//     return NextResponse.next();
//   }

//   if (!session?.accessToken) {
//     console.log("🔄 Redirecting to /sign-in because user is not authenticated");
//     return NextResponse.redirect(new URL("/sign-in", req.url));
//   }

//   if (pathname.startsWith("/user") && session?.user.role !== "user") {
//     console.log("✅ User is authenticated, allowing request");
//     return NextResponse.redirect(new URL("/", req.url));
//   }

//   // 🔹 If the user is NOT an affiliate & tries to access `/affiliate/*`, redirect them to home
//   if (pathname.startsWith("/affiliate") && session?.user.role !== "affiliate") {
//     console.log("🛂 affiliate is authenticated");
//     return NextResponse.redirect(new URL("/", req.url));
//   }

//   // ✅ Allow authenticated users to proceed
//   console.log("✅ User is authenticated, but no specific match in middleware");
//   return NextResponse.next();
// }

// **Apply middleware to all routes**

export const config = {
  matcher: "/:path*",
};
