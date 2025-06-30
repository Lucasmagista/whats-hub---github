import crypto from "crypto"
import { prisma } from "./prisma"

export class SecurityManager {
  private static readonly ENCRYPTION_ALGORITHM = "aes-256-gcm"
  private static readonly KEY_LENGTH = 32
  private static readonly IV_LENGTH = 16
  private static readonly TAG_LENGTH = 16

  static generateSecretKey(): string {
    return crypto.randomBytes(this.KEY_LENGTH).toString("hex")
  }

  static encrypt(text: string, key: string): string {
    const iv = crypto.randomBytes(this.IV_LENGTH)
    const cipher = crypto.createCipher(this.ENCRYPTION_ALGORITHM, Buffer.from(key, "hex"))
    cipher.setAAD(Buffer.from("whatsbot", "utf8"))

    let encrypted = cipher.update(text, "utf8", "hex")
    encrypted += cipher.final("hex")

    const tag = cipher.getAuthTag()

    return iv.toString("hex") + ":" + tag.toString("hex") + ":" + encrypted
  }

  static decrypt(encryptedText: string, key: string): string {
    const parts = encryptedText.split(":")
    if (parts.length !== 3) {
      throw new Error("Invalid encrypted text format")
    }

    const iv = Buffer.from(parts[0], "hex")
    const tag = Buffer.from(parts[1], "hex")
    const encrypted = parts[2]

    const decipher = crypto.createDecipher(this.ENCRYPTION_ALGORITHM, Buffer.from(key, "hex"))
    decipher.setAAD(Buffer.from("whatsbot", "utf8"))
    decipher.setAuthTag(tag)

    let decrypted = decipher.update(encrypted, "hex", "utf8")
    decrypted += decipher.final("utf8")

    return decrypted
  }

  static async logSecurityEvent(
    type: string,
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
    description: string,
    userId?: string,
    metadata?: any,
  ) {
    await prisma.securityEvent.create({
      data: {
        type,
        severity,
        description,
        userId,
        metadata,
      },
    })
  }

  static generateApiKey(): string {
    return "sk_" + crypto.randomBytes(32).toString("hex")
  }

  static hashApiKey(apiKey: string): string {
    return crypto.createHash("sha256").update(apiKey).digest("hex")
  }

  static validateApiKey(apiKey: string, hashedKey: string): boolean {
    return this.hashApiKey(apiKey) === hashedKey
  }

  static async rateLimit(identifier: string, limit: number, windowMs: number): Promise<boolean> {
    // Implementation would use Redis or similar for production
    // This is a simplified version
    const key = `rate_limit:${identifier}`
    const now = Date.now()

    // In production, use Redis with sliding window
    return true // Simplified for demo
  }

  static sanitizeInput(input: string): string {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+\s*=/gi, "")
      .trim()
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  static validatePhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-$$$$]{10,}$/
    return phoneRegex.test(phone)
  }

  static generateTOTP(secret: string): string {
    // Implementation for TOTP generation
    // Would use libraries like 'otplib' in production
    return "123456" // Simplified for demo
  }

  static verifyTOTP(token: string, secret: string): boolean {
    // Implementation for TOTP verification
    return token === "123456" // Simplified for demo
  }
}
