"use client"

import type React from "react"
import { useSearchParams } from "next/navigation"
import { LoginForm } from "./login-form"

interface LoginFormProps extends React.ComponentPropsWithoutRef<"div"> {
  message?: string | null
  redirect?: string | null
}

function LoginFormWithParams(props: React.ComponentPropsWithoutRef<"div">) {
  const searchParams = useSearchParams()
  const message = searchParams.get('message')
  const redirect = searchParams.get('redirect')
  
  return <LoginForm {...props} message={message} redirect={redirect} />
}

export { LoginFormWithParams as LoginForm }
