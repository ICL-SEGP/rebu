import { API_BASE_URL } from "@/lib/constants";
import { Session } from "inspector/promises";
import { TreePalm } from "lucide-react";
import NextAuth from "next-auth";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // 1️⃣ Send sign-in request to Phoenix
        const response = await fetch(`${API_BASE_URL}/sign-in`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials?.email,
            password: credentials?.password,
          }),
        });

        if (!response.ok) throw new Error("Invalid credentials");


        // Phoenix responds with a JWT
        const user = (await response.json()); // Expecting { id, name, email, token }

        // NextAuth stores the JWT
        return user ? { id: user.id, email: user.email, accessToken: user.token, role: user.role, firstName: user.first_name } : null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.id = user.id
        token.email = user.email;
        token.firstName = user.firstName;
        token.role = user.role
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.firstName = token.firstName;
      session.user.role = token.role;
      return session;
    },
  },
  session: {
    strategy: "jwt", // 🔹 NextAuth handles authentication with JWT
  },
  secret: "83e9b797df942c9769653bee15485beca10a6d2a8ec296b420a36841a3cf9462"
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };