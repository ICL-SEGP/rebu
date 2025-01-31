import NextAuth from "next-auth";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { setCookie } from "cookies-next";
var x = 0

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      
      async authorize(credentials) {
        const res = await fetch(
          "http://176.34.210.163:4000/api/sign-in",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              password: credentials?.password,
              email: credentials?.email
              ,
            }),
          }
        );
        // console.log(res)
        // console.log(res)

        if (!res.ok) {
          throw new Error("Invalid email or password");
        }

        const data = await res.json();
        const token = data.token; // Assume the backend returns a token
        // console.log(token)

        if (token) {
          // Optionally store token in cookies
          setCookie("authToken", token, {
            httpOnly: true,
            sameSite: "strict",
            maxAge: 60 * 60 * 24, // 1 day
          });

          // Return user object with token
          x += 1
          return {id: String(x), email: credentials?.email, token };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.token; // Add token to JWT
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken; // Add accessToken to session
      return session;
    },
  },
  session: {
    strategy: "jwt", // Use JWT for session management
  },
  secret: process.env.NEXTAUTH_SECRET, // Add a secret in your .env file
};

// Ensure the NextAuth handler supports both GET and POST methods
const handler = NextAuth(authOptions);

// Export the handler for both GET and POST methods
export { handler as GET, handler as POST };