<div align="center">
<img src="./.github/assets/ts-match.svg" alt="ts-match - Type-safe pattern matching for TypeScript" width="300"/>

<p align="center">
  <a href="https://github.com/0xdsqr/ts-match/actions/workflows/test.yml"><img src="https://img.shields.io/github/actions/workflow/status/0xdsqr/ts-match/test.yml?style=for-the-badge&logo=github&label=tests" alt="Tests Status"></a>
  <a href="#"><img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="#"><img src="https://img.shields.io/badge/coverage-100%25-brightgreen?style=for-the-badge&logo=codecov&logoColor=white" alt="Code Coverage"></a>
  <!-- <a href="#"><img src="https://img.shields.io/badge/size-<1kb-blue?style=for-the-badge&logo=npm" alt="Bundle Size"></a> -->
</p>
</div>

## ⇁ TOC
* [The Problem](#-the-problem)
* [The Solution](#-the-solution)
* [Key Features](#-key-features)
* [Installation](#-installation)
* [Quick Start](#-quick-start)
* [Development with Nix](#-development-with-nix)
    * [Development Environment Setup](#development-environment-setup)
    * [Testing](#testing)
    * [Running Examples](#running-examples)
* [Real-World Comparison](#-real-world-comparison)
* [API Reference](#-api-reference)
    * [Basic Pattern Matching](#basic-pattern-matching)
    * [Default Cases and Error Handling](#default-cases-and-error-handling)
    * [Advanced Patterns](#advanced-patterns)
    * [Type Helpers](#type-helpers)
* [Real-World Examples](#-real-world-examples)
* [TypeScript Features](#-typescript-features)
* [Contributing](#-contributing)
* [License](#-license)

<br>

A lightweight, type-safe pattern matching utility for TypeScript. Transform messy `if/else` chains and verbose `switch` statements into clean, functional expressions with full type safety and exhaustiveness checking.

## ⇁ The Problem
You're tired of verbose `switch` statements and nested `if/else` chains. You want type-safe conditional logic that catches missing cases at compile time and returns values directly without manual breaks or forgotten returns.

## ⇁ The Solution
Pattern matching is a powerful control flow construct that's cleaner and more expressive than traditional approaches. With `ts-match`, you get compile-time type safety, exhaustiveness checking, and a functional approach to conditional logic.

## ⇁ Key Features

- 🎯 **Type-safe** - Full TypeScript inference, no `any` types
- 🛡️ **Exhaustive** - Compiler catches missing cases
- 🚀 **Zero dependencies** - <1KB bundle size
- ✨ **Expression-based** - Returns values instead of requiring mutations
- 📦 **Tree-shakeable** - Import only what you need


## ⇁ Installation

| Package Manager | Command                      |
| --------------- | ---------------------------- |
| **npm**         | `npm install @dsqr/ts-match` |
| **pnpm**        | `pnpm add @dsqr/ts-match`    |
| **bun**         | `bun add @dsqr/ts-match`     |
| **yarn**        | `yarn add @dsqr/ts-match`    |

## ⇁ Quick Start

```typescript
import { match } from "@dsqr/ts-match"

// Handle user permissions
const getAccessLevel = (role: "admin" | "user" | "guest") =>
  match(role)({
    admin: () => ({ canDelete: true, canEdit: true, canView: true }),
    user: () => ({ canDelete: false, canEdit: true, canView: true }),
    guest: () => ({ canDelete: false, canEdit: false, canView: true }),
  })

console.log(getAccessLevel("user"))
// { canDelete: false, canEdit: true, canView: true }
```

## ⇁ Development with Nix

### Development Environment Setup

Clone and enter the development environment:

```bash
git clone https://github.com/0xdsqr/ts-match.git
cd ts-match
nix develop
```

### Testing

Run tests with coverage:

```bash
# Run tests directly
bun test --coverage

# Run tests via Nix (with visible output)
nix build .#test

# Run tests via Nix (silent, for CI)
nix flake check
```

### Running Examples

```bash
# Run examples directly
bun run examples/index.ts

# Run examples via Nix
nix run .#examples
```

## ⇁ Real-World Comparison

Here's how `ts-match` compares to traditional approaches:

### HTTP Status Handling

```typescript
// Traditional switch - verbose, imperative
function handleStatus(code: number): string {
  switch (code) {
    case 200:
      return "Success"
    case 404:
      return "Not Found"
    case 500:
      return "Server Error"
    default:
      return "Unknown"
  }
}

// ts-match - clean, functional, type-safe
const handleStatus = (code: number) =>
  match(code)({
    200: () => "Success",
    404: () => "Not Found",
    500: () => "Server Error",
    _: () => "Unknown",
  })
```

### React State Management

```typescript
type LoadingState = "idle" | "loading" | "success" | "error";

// Traditional - breaks JSX flow
function StatusComponent({ state }: { state: LoadingState }) {
  let content;
  switch (state) {
    case "idle": content = <div>Ready to start</div>; break;
    case "loading": content = <Spinner />; break;
    case "success": content = <SuccessIcon />; break;
    case "error": content = <ErrorMessage />; break;
  }
  return <div className="status">{content}</div>;
}

// ts-match - stays in expression context
function StatusComponent({ state }: { state: LoadingState }) {
  return (
    <div className="status">
      {match(state)({
        "idle": () => <div>Ready to start</div>,
        "loading": () => <Spinner />,
        "success": () => <SuccessIcon />,
        "error": () => <ErrorMessage />
      })}
    </div>
  );
}
```

## ⇁ API Reference

<details><summary><strong>Basic Pattern Matching</strong></summary>

Match against string, number, or symbol values with type-safe handlers.

**String matching**

```typescript
const handleHttpMethod = (method: "GET" | "POST" | "PUT" | "DELETE") =>
  match(method)({
    GET: () => "Fetching data",
    POST: () => "Creating resource",
    PUT: () => "Updating resource",
    DELETE: () => "Removing resource",
  })
```

**Number matching**

```typescript
const getHttpMessage = (code: number) =>
  match(code)({
    200: () => "OK",
    201: () => "Created",
    400: () => "Bad Request",
    404: () => "Not Found",
    500: () => "Server Error",
    _: () => "Unknown status code",
  })
```

**Symbol matching**

```typescript
const PENDING = Symbol("pending")
const COMPLETE = Symbol("complete")

const getTaskStatus = (status: symbol) =>
  match(status)({
    [PENDING]: () => "Task in progress",
    [COMPLETE]: () => "Task finished",
    _: () => "Unknown status",
  })
```

</details>

<details><summary><strong>Default Cases and Error Handling</strong></summary>

Handle pattern matching failures gracefully with the custom `MatchError` class.

**With default fallback**

```typescript
const handleUserInput = (input: string) =>
  match(input)({
    yes: () => true,
    no: () => false,
    _: () => null, // Fallback for any other input
  })
```

**Without default (throws MatchError)**

```typescript
import { MatchError } from "@dsqr/ts-match"

try {
  const result = match("maybe")({
    yes: () => true,
    no: () => false,
    // No "_" - will throw for unmatched values
  })
} catch (error) {
  if (error instanceof MatchError) {
    console.log("Unhandled input:", error.message)
  }
}
```

</details>

<details><summary><strong>Advanced Patterns</strong></summary>

**Nested matching**

```typescript
const authorize = (role: string, action: string) =>
  match(role)({
    admin: () => "allowed", // Admins can do anything
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
```

**Complex return types**

```typescript
interface DatabaseConfig {
  host: string
  port: number
  ssl: boolean
}

const getDatabaseConfig = (env: string): DatabaseConfig =>
  match(env)({
    production: () => ({
      host: "prod-db.company.com",
      port: 5432,
      ssl: true,
    }),
    development: () => ({
      host: "localhost",
      port: 5432,
      ssl: false,
    }),
    _: () => ({
      host: "localhost",
      port: 5432,
      ssl: false,
    }),
  })
```

</details>

<details><summary><strong>Type Helpers</strong></summary>

Use exported types for better code organization and reusability.

**Reusable patterns**

```typescript
import { Pattern } from "@dsqr/ts-match"

type Theme = "light" | "dark" | "auto"

// Define reusable pattern object
const themeStyles: Pattern<Theme, string> = {
  light: () => "bg-white text-black",
  dark: () => "bg-black text-white",
  auto: () => "bg-gray-100 text-gray-900",
}

// Use anywhere
const getThemeClasses = (theme: Theme) => match(theme)(themeStyles)
```

**Matcher<T> - Higher-order pattern functions**

```typescript
import { Matcher, Pattern } from "@dsqr/ts-match"

class HttpService {
  constructor(private matcher: Matcher<"GET" | "POST">) {}

  request(method: "GET" | "POST") {
    return this.matcher({
      GET: () => "Fetching data...",
      POST: () => "Sending data...",
      _: () => "Unsupported method",
    })
  }
}
```

</details>

## ⇁ Real-World Examples

<details><summary><strong>Form Validation</strong></summary>

```typescript
type ValidationResult = "valid" | "empty" | "too_short" | "invalid_email"

const getValidationMessage = (result: ValidationResult) =>
  match(result)({
    valid: () => null,
    empty: () => "This field is required",
    too_short: () => "Must be at least 3 characters",
    invalid_email: () => "Please enter a valid email address",
  })
```

</details>

<details><summary><strong>File Processing</strong></summary>

```typescript
const processFile = (extension: string) =>
  match(extension.toLowerCase())({
    jpg: () => processImage,
    png: () => processImage,
    pdf: () => processPDF,
    txt: () => processText,
    csv: () => processCSV,
    _: () => () => {
      throw new Error(`Unsupported file type: ${extension}`)
    },
  })
```

</details>

<details><summary><strong>Game State Management</strong></summary>

```typescript
type GameState = "menu" | "playing" | "paused" | "game_over";

const renderGameScreen = (state: GameState) =>
  match(state)({
    "menu": () => <MainMenu />,
    "playing": () => <GameBoard />,
    "paused": () => <PauseOverlay />,
    "game_over": () => <GameOverScreen />
  });
```

</details>

<details><summary><strong>API Response Handling</strong></summary>

```typescript
interface ApiResponse<T> {
  status: "success" | "error" | "loading"
  data?: T
  error?: string
}

const processResponse = <T>(response: ApiResponse<T>) =>
  match(response.status)({
    success: () => ({
      ui: "Success!",
      data: response.data,
      error: null,
    }),
    error: () => ({
      ui: "Error occurred",
      data: null,
      error: response.error,
    }),
    loading: () => ({
      ui: "Loading...",
      data: null,
      error: null,
    }),
  })
```

</details>

<details><summary><strong>State Management</strong></summary>

```typescript
type AppState = "loading" | "ready" | "error"

const renderApp = (state: AppState) =>
  match(state)({
    loading: () => `<div class="spinner">Loading...</div>`,
    ready: () => `<div class="app">App ready!</div>`,
    error: () => `<div class="error">Something went wrong</div>`,
  })
```

</details>

<details><summary><strong>Route Handling</strong></summary>

```typescript
const handleRoute = (path: string) =>
  match(path)({
    "/": () => renderHomePage(),
    "/about": () => renderAboutPage(),
    "/contact": () => renderContactPage(),
    _: () => render404Page(),
  })
```

</details>

## ⇁ TypeScript Features

ts-match leverages TypeScript's type system for safety and developer experience:

**Exhaustiveness checking**

```typescript
type Status = "pending" | "approved" | "rejected"

// This compiles
const handleComplete = (status: Status) =>
  match(status)({
    pending: () => "Waiting",
    approved: () => "Done",
    rejected: () => "Failed",
  })

// TypeScript error - missing "rejected" case
const handleIncomplete = (status: Status) =>
  match(status)({
    pending: () => "Waiting",
    approved: () => "Done",
    // Error: missing pattern for "rejected"
  })
```

**Full type inference**

```typescript
// Return type automatically inferred as string | number
const getValue = (key: "name" | "age") =>
  match(key)({
    name: () => "John", // string
    age: () => 25, // number
  })
```

## ⇁ Contributing

Built for learning and experimentation. Open a PR or issue if you want, but no promises - this is a simple two-file project. Feel free to fork it and make it your own!

## ⇁ License

MIT - Do whatever you want with it.

---

*Built for developers with ADHD by developers with ADHD.*

*Your experiments deserve a home.* 🏠
