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
        // Check if credentials are provided
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          const res = await fetch(
            `http://176.34.210.163:4000/api/sign-in`, // Use environment variable for API URL
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
            }
          );

          // Handle API errors
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Invalid email or password");
          }

          const data = await res.json();
          const token = data.token; // Assume the backend returns a token

          if (token) {
            // Return the user object with the token
            return {
              id: credentials.email, // Use email as the unique identifier
              email: credentials.email,
              token: token, // Include the token in the user object
            };
          }
        } catch (error) {
          console.error("Authorization error:", error);
          throw new Error("An error occurred during authorization");
        }

        return null; // Return null if authorization fails
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
  secret: "83e9b797df942c9769653bee15485beca10a6d2a8ec296b420a36841a3cf9462", // Ensure this is set in your .env file
};

// Export the handler for both GET and POST methods
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };