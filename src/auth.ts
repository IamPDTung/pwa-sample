import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"

declare module "next-auth" {
  interface User {
    roles?: string[]
  }
}

declare module "next-auth" {
  interface Session {
    user: {
      roles?: string[]
    } & import("next-auth").DefaultSession["user"]
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    roles?: string[]
  }
}

function parseEmailList(key: string): string[] {
  const val = process.env[key]
  if (!val) return []
  return val
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: "https://accounts.google.com/o/oauth2/v2/auth",
      token: "https://oauth2.googleapis.com/token",
      userinfo: "https://openidconnect.googleapis.com/v1/userinfo",
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        const email = user.email?.toLowerCase() ?? ""
        const adminEmails = parseEmailList("SSO_ADMIN_EMAILS")
        const editorEmails = parseEmailList("SSO_EDITOR_EMAILS")

        if (adminEmails.includes(email)) {
          token.roles = ["admin", "editor", "viewer"]
        } else if (editorEmails.includes(email)) {
          token.roles = ["editor", "viewer"]
        } else {
          token.roles = ["viewer"]
        }
      }
      return token
    },
    session({ session, token }) {
      session.user.roles = token.roles
      return session
    },
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user
      const path = request.nextUrl.pathname
      const isProtected =
        path.startsWith("/sso/dashboard") ||
        path.startsWith("/sso/admin") ||
        path.startsWith("/sso/editor")

      if (isProtected && !isLoggedIn) {
        return Response.redirect(new URL("/sso", request.nextUrl))
      }
      return true
    },
  },
})
