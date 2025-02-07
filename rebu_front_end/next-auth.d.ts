import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string; // Add `id` property to the User type
    email?: string; // Make `email` optional
    token: string;
    role: string;
  }

  interface Session {
    accessToken: string;
    role: string;
    user: {
      id: string;
      name?: string;
      email?: string;
      token: string;
      role: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string;
    id?: string; // Add `id` property to the JWT type
    email?: string; // Add `email` to JWT (optional)
    role: string;
    name: string;
  }
}
