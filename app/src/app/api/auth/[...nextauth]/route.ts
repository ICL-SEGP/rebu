import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import NextAuth from "next-auth";

// Define the authentication options
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "test@gmail.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Hardcoded user authentication logic
        if (
          credentials?.email === "test@gmail.com" &&
          credentials?.password === "test"
        ) {
          return { id: "1", name: "Test User", email: "test@gmail.com" }; // Return user object
        }
        return null; // Return null if authentication fails
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name || "Unknown"; // Provide a fallback
        token.email = user.email || "unknown@example.com"; // Provide a fallback
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id as string,
        name: token.name as string,
        email: token.email as string,
      };
      return session;
    },
  },
};

// Ensure the NextAuth handler supports both GET and POST methods
const handler = NextAuth(authOptions);

// Export the handler for both GET and POST methods
export { handler as GET, handler as POST };
