import { API_BASE_URL } from "@/lib/constants";
import NextAuth from "next-auth";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import humps from "humps";

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        isAffiliate: { label: "userType", type: "username" },
      },
      async authorize(credentials) {
        // 1️⃣ Send sign-in request to Phoenix
        const response = await fetch(`${API_BASE_URL}/sign-in`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials?.email,
            password: credentials?.password,
            is_affiliate: credentials?.isAffiliate,
          }),
        });

        if (!response.ok) throw new Error("Invalid credentials");

        // Phoenix responds with a JWT
        const res = await response.json(); // Expecting { id, name, email, token }
        // console.log(res)
        const user = {
          user: humps.camelizeKeys(res.user),
          token: res.token,
        };
        // NextAuth stores the JWT
        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      console.log("user", user);
      if (trigger === "update") {
        token.user = session.user;
        return token;
      }
      if (user) {
        token.accessToken = user.token;
        token.user = user.user;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.accessToken = token.accessToken;
        session.user = token.user;
      }

      return session;
    },
  },
  session: {
    strategy: "jwt", // 🔹 NextAuth handles authentication with JWT
  },
  secret: "83e9b797df942c9769653bee15485beca10a6d2a8ec296b420a36841a3cf9462",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
