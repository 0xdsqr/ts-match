import { describe, it, expect } from "bun:test"
import { match, MatchError, type Pattern, type Matcher } from "./match"

describe("match function", () => {
  describe("basic pattern matching", () => {
    it("should match exact string values", () => {
      const result = match("hello")({
        hello: () => "world",
        goodbye: () => "farewell",
      })

      expect(result).toBe("world")
    })

    it("should match exact number values", () => {
      const result = match(42)({
        42: () => "answer",
        0: () => "zero",
      })

      expect(result).toBe("answer")
    })

    it("should match symbol values", () => {
      const sym1 = Symbol("test1")
      const sym2 = Symbol("test2")

      const result = match(sym1)({
        [sym1]: () => "matched symbol 1",
        [sym2]: () => "matched symbol 2",
      })

      expect(result).toBe("matched symbol 1")
    })

    it("should return different types based on pattern", () => {
      const stringResult = match("a")({
        a: () => "string result",
        b: () => 42,
      })

      const numberResult = match("b")({
        a: () => "string result",
        b: () => 42,
      })

      expect(stringResult).toBe("string result")
      expect(numberResult).toBe(42)
    })
  })

  describe("wildcard pattern (_)", () => {
    it("should use wildcard when no exact match found", () => {
      const result = match("unknown")({
        hello: () => "world",
        _: () => "default",
      })

      expect(result).toBe("default")
    })

    it("should prefer exact match over wildcard", () => {
      const result = match("hello")({
        hello: () => "exact",
        _: () => "default",
      })

      expect(result).toBe("exact")
    })

    it("should work with wildcard only", () => {
      const result = match("anything")({
        _: () => "caught all",
      })

      expect(result).toBe("caught all")
    })
  })

  describe("error handling", () => {
    it("should throw MatchError when no pattern matches and no wildcard", () => {
      expect(() => {
        match("unknown")({
          hello: () => "world",
          goodbye: () => "farewell",
        })
      }).toThrow(MatchError)
    })

    it("should include the unmatched value in error message", () => {
      expect(() => {
        match("test-value")({
          hello: () => "world",
        })
      }).toThrow("No pattern found for value: test-value")
    })

    it("should handle numeric values in error message", () => {
      expect(() => {
        match(999)({
          1: () => "one",
          2: () => "two",
        })
      }).toThrow("No pattern found for value: 999")
    })

    it("should handle symbol values in error message", () => {
      const testSymbol = Symbol("test")
      expect(() => {
        match(testSymbol)({
          [Symbol("other")]: () => "other",
        })
      }).toThrow("No pattern found for value: Symbol(test)")
    })
  })

  describe("complex scenarios", () => {
    it("should work with functions that have side effects", () => {
      let sideEffect = ""

      match("trigger")({
        trigger: () => {
          sideEffect = "executed"
          return "result"
        },
        _: () => "default",
      })

      expect(sideEffect).toBe("executed")
    })

    it("should work with async functions", async () => {
      const result = match("async")({
        async: () => Promise.resolve("async result"),
        _: () => Promise.resolve("default"),
      })

      expect(await result).toBe("async result")
    })

    it("should work with object return values", () => {
      const result = match("object")({
        object: () => ({ key: "value", nested: { prop: 42 } }),
        _: () => ({}),
      })

      expect(result).toEqual({ key: "value", nested: { prop: 42 } })
    })

    it("should work with array return values", () => {
      const result = match("array")({
        array: () => [1, 2, 3, "mixed"],
        _: () => [],
      })

      expect(result).toEqual([1, 2, 3, "mixed"])
    })

    it("should work with null and undefined return values", () => {
      const nullResult = match("null")({
        null: () => null,
        _: () => "default",
      })

      const undefinedResult = match("undefined")({
        undefined: () => undefined,
        _: () => "default",
      })

      expect(nullResult).toBeNull()
      expect(undefinedResult).toBeUndefined()
    })
  })

  describe("edge cases", () => {
    it("should handle empty string as key", () => {
      const result = match("")({
        "": () => "empty string matched",
        _: () => "default",
      })

      expect(result).toBe("empty string matched")
    })

    it("should handle zero as key", () => {
      const result = match(0)({
        0: () => "zero matched",
        _: () => "default",
      })

      expect(result).toBe("zero matched")
    })

    it("should handle negative numbers", () => {
      const result = match(-1)({
        [-1]: () => "negative one",
        _: () => "default",
      })

      expect(result).toBe("negative one")
    })

    it("should work with string vs numeric keys separately", () => {
      const stringResult = match("42")({
        "42": () => "string forty-two",
        _: () => "default",
      })

      const numberResult = match(42)({
        42: () => "number forty-two",
        _: () => "default",
      })

      expect(stringResult).toBe("string forty-two")
      expect(numberResult).toBe("number forty-two")
    })
  })
})

describe("MatchError class", () => {
  it("should be an instance of Error", () => {
    const error = new MatchError("test message")
    expect(error).toBeInstanceOf(Error)
  })

  it("should have correct name property", () => {
    const error = new MatchError("test message")
    expect(error.name).toBe("MatchError")
  })

  it("should preserve the message", () => {
    const message = "Custom error message"
    const error = new MatchError(message)
    expect(error.message).toBe(message)
  })

  it("should have a stack trace", () => {
    const error = new MatchError("test")
    expect(error.stack).toBeDefined()
    expect(typeof error.stack).toBe("string")
  })

  it("should be throwable and catchable", () => {
    expect(() => {
      throw new MatchError("test error")
    }).toThrow(MatchError)

    try {
      throw new MatchError("test error")
    } catch (error) {
      expect(error).toBeInstanceOf(MatchError)
      expect((error as MatchError).message).toBe("test error")
    }
  })

  it("should work with instanceof checks", () => {
    const error = new MatchError("test")
    expect(error instanceof MatchError).toBe(true)
    expect(error instanceof Error).toBe(true)
  })
})

describe("type exports", () => {
  it("should export Pattern type", () => {
    type TestPattern = Pattern<"a" | "b", string>
    const pattern: TestPattern = {
      a: () => "value a",
      b: () => "value b",
      _: () => "default",
    }

    expect(typeof pattern.a).toBe("function")
    expect(typeof pattern.b).toBe("function")
    expect(typeof pattern._).toBe("function")
  })

  it("should export Matcher type", () => {
    type TestMatcher = Matcher<"x" | "y">
    const matcher: TestMatcher = (patterns) => {
      return patterns.x()
    }

    expect(typeof matcher).toBe("function")
  })
})

describe("integration scenarios", () => {
  it("should work in a state machine pattern", () => {
    type State = "idle" | "loading" | "success" | "error"

    const handleState = (state: State) =>
      match(state)({
        idle: () => "Ready to start",
        loading: () => "Processing...",
        success: () => "Operation completed",
        error: () => "Something went wrong",
      })

    expect(handleState("idle")).toBe("Ready to start")
    expect(handleState("loading")).toBe("Processing...")
    expect(handleState("success")).toBe("Operation completed")
    expect(handleState("error")).toBe("Something went wrong")
  })

  it("should work with HTTP status codes", () => {
    const handleStatus = (code: number) =>
      match(code)({
        200: () => "OK",
        404: () => "Not Found",
        500: () => "Internal Server Error",
        _: () => "Unknown Status",
      })

    expect(handleStatus(200)).toBe("OK")
    expect(handleStatus(404)).toBe("Not Found")
    expect(handleStatus(500)).toBe("Internal Server Error")
    expect(handleStatus(418)).toBe("Unknown Status")
  })

  it("should work with nested matching", () => {
    const outerResult = match("outer")({
      outer: () =>
        match("inner")({
          inner: () => "nested match success",
          _: () => "inner default",
        }),
      _: () => "outer default",
    })

    expect(outerResult).toBe("nested match success")
  })

  it("should work with curried usage", () => {
    const createMatcher = <T extends PropertyKey>(value: T) => match(value)

    const stringMatcher = createMatcher("test")
    const result = stringMatcher({
      test: () => "matched",
      _: () => "default",
    })

    expect(result).toBe("matched")
  })
})
