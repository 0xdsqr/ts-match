function match<T extends PropertyKey>(value: T) {
  return function <
    P extends Record<PropertyKey, () => any> & { readonly _?: () => any },
  >(
    patterns: P,
  ): P[T] extends () => infer R
    ? R
    : P["_"] extends () => infer R
      ? R
      : never {
    const handler = patterns[value] ?? patterns._

    if (!handler) {
      throw new MatchError(`No pattern found for value: ${String(value)}`)
    }

    return handler()
  }
}

class MatchError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "MatchError"

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if ((Error as any).captureStackTrace) {
      ;(Error as any).captureStackTrace(this, MatchError)
    }
  }
}

type Pattern<T extends PropertyKey, R> = Record<T, () => R> & {
  readonly _?: () => R
}

type Matcher<T extends PropertyKey> = <R>(patterns: Pattern<T, R>) => R

export { match, MatchError }
export type { Pattern, Matcher }
