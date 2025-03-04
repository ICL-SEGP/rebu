import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    accessToken: string;
    role: string;
    firstName: string;
    mint: string;
  }

  interface Session {
    accessToken: string;
    mint: Mint;
    user: User
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string;
    id: string;
    email: string;
    role: string;
    firstName: string;
    mint: string;
  }
}
