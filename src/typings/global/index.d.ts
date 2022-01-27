declare type Primitive =
  | null
  | undefined
  | string
  | number
  | boolean
  | symbol
  | bigint

declare type DeepPartial<TValue> = {
  [key in keyof TValue]?: DeepPartial<TValue[key]>
}

declare type Noop = () => void