import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string; // Add `id` property to the User type
    token: string;
  }

  interface Session {
    accessToken: string; 
    user: {
      id: string;
      name: string;
      email: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string;
    id?: string; // Add `id` property to the JWT type
  }
}
