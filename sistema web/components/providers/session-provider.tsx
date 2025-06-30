"use client"

import { ReactNode } from "react"
import { SessionProvider } from "next-auth/react"

interface AuthProviderProps {
  readonly children: ReactNode
}

export function AuthProvider({ children }: Readonly<AuthProviderProps>) {
  return (
    <SessionProvider
      refetchInterval={5 * 60}
      refetchOnWindowFocus={false}
      refetchWhenOffline={false}
    >
      {children}
    </SessionProvider>
  )
}
