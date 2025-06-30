"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, ArrowLeft, KeyRound } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export function ForgotPasswordForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)
  }

  return (
    <div className={cn("w-full", className)} {...props}>
      {/* Background with gradient */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-50 via-white to-slate-100 p-8 shadow-2xl backdrop-blur-sm border border-white/20">
        {/* Decorative elements */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-orange-400 to-red-600 rounded-full opacity-10 blur-xl"></div>
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-tr from-blue-400 to-purple-500 rounded-full opacity-10 blur-xl"></div>

        <div className="relative z-10">
          {!isSubmitted ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl mb-4 shadow-lg">
                  <KeyRound className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
                  Forgot password?
                </h1>
                <p className="text-gray-500 text-sm">No worries, we'll send you reset instructions</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-11 h-12 bg-white/50 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                      required
                    />
                  </div>
                </div>

                {/* Reset Password Button */}
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                >
                  Reset password
                </Button>

                {/* Back to login */}
                <div className="text-center pt-4">
                  <Link
                    href="/login"
                    className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to login
                  </Link>
                </div>
              </form>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-4 shadow-lg">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
                  Check your email
                </h1>
                <p className="text-gray-500 text-sm mb-6">We sent a password reset link to your email address</p>

                <div className="space-y-4">
                  <Button
                    onClick={() => setIsSubmitted(false)}
                    className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                  >
                    Resend email
                  </Button>

                  <div className="text-center">
                    <Link
                      href="/login"
                      className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to login
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
