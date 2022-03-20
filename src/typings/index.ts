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

export type Noop = () => void
