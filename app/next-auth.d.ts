import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string; // Add `id` property to the User type
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string; // Add `id` property to the JWT type
  }
}
