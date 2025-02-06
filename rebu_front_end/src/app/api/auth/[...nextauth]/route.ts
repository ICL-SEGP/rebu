import { API_BASE_URL } from "@/lib/constants";
import NextAuth from "next-auth";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions:NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // 1️⃣ Send login request to Phoenix
        const res = await fetch(`${API_BASE_URL}/api/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials?.email,
            password: credentials?.password,
          }),
        });

        if (!res.ok) throw new Error("Invalid credentials");


        // 2️⃣ Phoenix responds with a JWT
        const user = (await res.json()).data; // Expecting { id, name, email, token }


        // 3️⃣ NextAuth stores the JWT
        return user ? { id: user.id, email: user.email, token: user.token, role: user.role } : null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.accessToken = user.token; // 4️⃣ Store JWT in NextAuth
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken; // 5️⃣ Add JWT to session object
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