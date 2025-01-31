import NextAuth, { User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "user" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Missing username or password");
        }

        try {
          const res = await fetch("http://176.34.210.163:4000/api/sign-in", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: credentials.username,
              password: credentials.password,
            }),
          });

          if (!res.ok) {
            throw new Error("Invalid username or password");
          }

          const user = await res.json(); // Expect user object from API

          // Ensure API returns all required user fields
          if (!user.id || !user.name || !user.email || !user.token) {
            throw new Error("Invalid response from authentication server");
          }

          // Return a user object that matches NextAuth’s expected type
          return {
            id: String(user.id), // Ensure ID is a string
            name: user.name,
            email: user.email,
            token: user.token, // Required field
          } as User; // Explicitly cast to NextAuth's User type
        } catch (error) {
          console.error("Authentication error:", error);
          throw new Error("Failed to authenticate");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.accessToken = user.token; // Store token inside JWT
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id as string,
        name: token.name as string,
        email: token.email as string,
      };
      session.accessToken = token.accessToken as string; // Include token in session
      return session;
    },
  },
  session: {
    strategy: "jwt", // Use JWT for session management
  },
  secret: process.env.NEXTAUTH_SECRET, // Ensure a secret is set in .env
});
