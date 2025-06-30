import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role?: string
      permissions?: string
      isActive?: boolean
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    role?: string
    permissions?: string
    isActive?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid?: string
  }
}
