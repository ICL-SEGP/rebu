import NextAuth from "next-auth";
import { User as UserType } from "./types";

declare module "next-auth" {
  interface User {
    user: UserType
    token: string
  }

  interface Session {
    accessToken: string;
    mint: Mint;
    user: UserType;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string;
    user: UserType
  }
}
