"use client"

import { AppRecovery } from './app-recovery'

export function AppRecoveryProvider({ children }: { children: React.ReactNode }) {
  return <AppRecovery>{children}</AppRecovery>
}
