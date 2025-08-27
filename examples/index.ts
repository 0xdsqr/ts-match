#!/usr/bin/env bun
import { match, MatchError } from "../src"

function main() {
  console.log("ts-match Examples\n")

  // 1. HTTP Status Code Handling
  const getHttpMessage = (code: number) =>
    match(code)({
      200: () => "OK",
      404: () => "Not Found",
      500: () => "Server Error",
      _: () => "Unknown status code",
    })

  console.log("HTTP 200:", getHttpMessage(200))
  console.log("HTTP 404:", getHttpMessage(404))

  // 2. User Permission System
  interface UserConfig {
    permissions: string[]
    dashboard: string
  }

  const getUserConfig = (role: string): UserConfig =>
    match(role)({
      admin: () => ({
        permissions: ["read", "write", "delete", "manage"],
        dashboard: "/admin",
      }),
      user: () => ({
        permissions: ["read", "write"],
        dashboard: "/dashboard",
      }),
      guest: () => ({
        permissions: ["read"],
        dashboard: "/public",
      }),
      _: () => ({
        permissions: [],
        dashboard: "/login",
      }),
    })

  console.log("Admin config:", getUserConfig("admin"))

  // 3. API Response Handling
  interface ApiResponse<T> {
    status: "success" | "error" | "loading"
    data?: T
    error?: string
  }

  const handleApiResponse = <T>(response: ApiResponse<T>) =>
    match(response.status)({
      success: () => ({
        ui: "Success",
        data: response.data,
      }),
      error: () => ({
        ui: "Error",
        message: response.error,
      }),
      loading: () => ({
        ui: "Loading...",
        data: null,
      }),
    })

  const successResponse: ApiResponse<{ id: number; name: string }> = {
    status: "success",
    data: { id: 1, name: "John Doe" },
  }

  console.log("API Success:", handleApiResponse(successResponse))

  // 4. File Processing
  const processFile = (filename: string) => {
    const extension = filename.split(".").pop()?.toLowerCase() || ""
    return match(extension)({
      jpg: () => `Processing image: ${filename}`,
      png: () => `Processing image: ${filename}`,
      pdf: () => `Processing document: ${filename}`,
      txt: () => `Processing text file: ${filename}`,
      _: () => `Unknown file type: ${filename}`,
    })
  }

  console.log(processFile("photo.jpg"))
  console.log(processFile("unknown.xyz"))

  // 5. Payment Processing
  type PaymentMethod = "credit_card" | "paypal" | "bank_transfer"

  const processPayment = (method: PaymentMethod, amount: number) =>
    match(method)({
      credit_card: () => ({
        success: true,
        message: "Credit card payment processed",
        fee: amount * 0.029,
      }),
      paypal: () => ({
        success: true,
        message: "PayPal payment processed",
        fee: amount * 0.034,
      }),
      bank_transfer: () => ({
        success: true,
        message: "Bank transfer initiated",
        fee: 5.0,
      }),
    })

  console.log("Credit card payment:", processPayment("credit_card", 100))

  // 6. Route Handling
  const handleRoute = (path: string) =>
    match(path)({
      "/": () => "Home Page",
      "/about": () => "About Page",
      "/contact": () => "Contact Page",
      _: () => "404 Not Found",
    })

  console.log("Route /:", handleRoute("/"))
  console.log("Route /unknown:", handleRoute("/unknown"))

  // 7. Form Validation
  type ValidationResult = "valid" | "empty" | "too_short" | "invalid_email"

  const getValidationMessage = (result: ValidationResult) =>
    match(result)({
      valid: () => null,
      empty: () => "This field is required",
      too_short: () => "Must be at least 3 characters",
      invalid_email: () => "Please enter a valid email address",
    })

  console.log("Validation empty:", getValidationMessage("empty"))

  // 8. Error Handling Example
  try {
    match("unknown")({
      expected: () => "This works",
      known: () => "This too",
    })
  } catch (error) {
    if (error instanceof MatchError) {
      console.log("Caught MatchError:", error.message)
    }
  }

  // 9. Nested Authorization
  const authorize = (role: string, action: string) =>
    match(role)({
      admin: () => "allowed",
      user: () =>
        match(action)({
          read: () => "allowed",
          write: () => "allowed",
          _: () => "denied",
        }),
      guest: () =>
        match(action)({
          read: () => "allowed",
          _: () => "denied",
        }),
      _: () => "invalid role",
    })

  console.log("User read access:", authorize("user", "read"))
  console.log("Guest write access:", authorize("guest", "write"))

  console.log("\nAll examples completed!")
}

// Run the examples
if (import.meta.main) {
  main()
}
