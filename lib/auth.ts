import NextAuth, { CredentialsSignin, type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";

class DisabledAccountError extends CredentialsSignin {
  code = "disabled";
}

declare module "next-auth" {
  interface User {
    accessToken?: string;
    xplenderRole?: string;
  }
  interface Session extends DefaultSession {
    accessToken?: string;
    xplenderRole?: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    accessToken?: string;
    xplenderRole?: string;
  }
}

export const { auth, signIn, signOut, handlers } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await fetch(
            `${process.env.XPLENDER_AUTH_URL}/auth/login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
              cache: "no-cache",
            }
          );
          if (res.status === 403) throw new DisabledAccountError();
          if (!res.ok) return null;
          const { accessToken } = await res.json();
          const payload = JSON.parse(
            Buffer.from(accessToken.split(".")[1], "base64url").toString()
          );
          return {
            id: payload.sub as string,
            email: payload.email as string,
            name: payload.name as string,
            accessToken,
            xplenderRole: payload.xplender_role as string,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 60 * 60 },
  trustHost: true,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.xplenderRole = user.xplenderRole;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.xplenderRole = token.xplenderRole;
      return session;
    },
  },
});
