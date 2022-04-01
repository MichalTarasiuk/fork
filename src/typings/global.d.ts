declare type Primitive =
  | null
  | undefined
  | string
  | number
  | boolean
  | symbol
  | bigint

declare type PickByValue<
  TObject extends Record<PropertyKey, unknown>,
  TValue
> = {
  [key in keyof TObject as TObject[key] extends TValue
    ? key
    : never]: TObject[key]
}

declare type AddByValue<
  TObject extends Record<PropertyKey, unknown>,
  TValue,
  TNewValue
> = {
  [key in keyof TObject]: TObject[key] extends TValue
    ? [TObject[key], TNewValue]
    : TObject[key]
}

declare type AsyncFunction = (...args: unknown[]) => Promise<unknown>

declare type Noop = () => void
