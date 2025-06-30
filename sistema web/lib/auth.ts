import { NextAuthOptions } from "next-auth"
import { getServerSession } from "next-auth/next"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { compare } from "bcryptjs"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Buscar usuário
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) {
          return null
        }

        // Verificar se o email foi verificado
        if (!user.emailVerified) {
          throw new Error("Email não verificado. Verifique seu email antes de fazer login.")
        }

        // Verificar se a conta está ativa
        if (!user.isActive) {
          throw new Error("Conta inativa. Entre em contato com o suporte.")
        }

        // Buscar senha na tabela Account
        const account = await prisma.account.findFirst({
          where: {
            userId: user.id,
            provider: "credentials"
          }
        })

        if (!account?.refresh_token) {
          return null
        }

        // Verificar senha
        const isPasswordValid = await compare(credentials.password, account.refresh_token)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login", // Error code passed in query string as ?error=
  },
  callbacks: {
    session: async ({ session, token }) => {
      if (token?.sub && session?.user) {
        session.user.id = token.sub

        // Fetch user role and permissions
        const user = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true, permissions: true, isActive: true },
        })

        if (user) {
          session.user.role = user.role
          session.user.permissions = user.permissions
          session.user.isActive = user.isActive
        }
      }
      return session
    },
    jwt: async ({ user, token }) => {
      if (user) {
        token.uid = user.id

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        })
      }
      return token
    },
    signIn: async ({ user, account }) => {
      if (account?.provider === "credentials") {
        // For credentials provider, user is already validated
        return true
      }
      
      if (account?.provider) {
        // Check if user exists and is active for OAuth providers
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        })

        if (existingUser && !existingUser.isActive) {
          return false // Prevent login for inactive users
        }

        // Set default role for new users
        if (!existingUser) {
          await prisma.user.update({
            where: { email: user.email! },
            data: {
              role: "AGENT",
              permissions: "read:dashboard,read:tickets,write:tickets",
            },
          })
        }
      }
      return true
    },
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  events: {
    signIn: async ({ user, account, isNewUser }) => {
      // Log security event
      await prisma.securityEvent.create({
        data: {
          type: "USER_LOGIN",
          severity: "INFO",
          description: `User ${user.email} signed in via ${account?.provider}`,
          userId: user.id,
          metadata: { provider: account?.provider, isNewUser },
        },
      })
    },
    signOut: async ({ token }) => {
      if (token?.sub) {
        await prisma.securityEvent.create({
          data: {
            type: "USER_LOGOUT",
            severity: "INFO", 
            description: `User signed out`,
            userId: token.sub,
          },
        })
      }
    },
  },
}

// Função helper para obter sessão nas API routes
export async function auth() {
  return await getServerSession(authOptions)
}

// Export da função getServerSession com authOptions configurado
export const getAuth = () => getServerSession(authOptions)
