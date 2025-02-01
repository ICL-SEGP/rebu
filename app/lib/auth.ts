// import NextAuth from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";

// export default NextAuth({
//   providers: [
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         username: { label: "Username", type: "text", placeholder: "user" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         // Validate user credentials
//         if (credentials?.username === "user" && credentials?.password === "password") {
//           return { id: "1", name: "John Doe", email: "johndoe@example.com" }; // Return a valid user
//         }
//         return null; // Return null if authentication fails
//       },
//     }),
//   ],
//   callbacks: {
//     async jwt({ token, user }) {
//       // Add user ID to the token
//       if (user) {
//         token.id = user.id;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       // Add the user ID to the session
//       session.user = {
//         id: token.id as string,
//         name: session.user?.name || "",
//         email: session.user?.email || "",
//       };
//       return session;
//     },
//   },
// });
