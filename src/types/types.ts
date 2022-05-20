export type Primitive =
  | null
  | undefined
  | string
  | number
  | boolean
  | symbol
  | bigint

export type Nil = undefined | null

export type AddBy<
  TObject extends Record<PropertyKey, unknown>,
  TValue,
  TNewValue
> = {
  readonly [key in keyof TObject]: TObject[key] extends TValue
    ? readonly [TObject[key], TNewValue]
    : TObject[key]
}

export type AsyncFunction = (...args: readonly unknown[]) => Promise<unknown>

export type Noop = () => void

export type ArrowFunction = (...args: readonly any[]) => unknown

export type EmptyObject = Record<PropertyKey, never>

// eslint-disable-next-line functional/prefer-readonly-type -- Mutable type
export type EmptyArray = Array<never>
