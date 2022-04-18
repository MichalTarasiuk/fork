export type Primitive =
  | null
  | undefined
  | string
  | number
  | boolean
  | symbol
  | bigint

export type Nill = undefined | null

export type AddBy<
  TObject extends Record<PropertyKey, unknown>,
  TValue,
  TNewValue
> = {
  [key in keyof TObject]: TObject[key] extends TValue
    ? [TObject[key], TNewValue]
    : TObject[key]
}

export type AsyncFunction = (...args: unknown[]) => Promise<unknown>

export type Noop = () => void
