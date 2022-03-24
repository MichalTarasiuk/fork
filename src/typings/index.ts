export type Primitive =
  | null
  | undefined
  | string
  | number
  | boolean
  | symbol
  | bigint

export type DeepPartial<TValue> = {
  [key in keyof TValue]?: DeepPartial<TValue[key]>
}

export type PickByValue<
  TObject extends Record<PropertyKey, unknown>,
  TValue
> = {
  [key in keyof TObject as TObject[key] extends TValue
    ? key
    : never]: TObject[key]
}

export type AddByValue<
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
