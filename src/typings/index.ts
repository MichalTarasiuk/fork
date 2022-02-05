type Primitive = null | undefined | string | number | boolean | symbol | bigint

type DeepPartial<TValue> = {
  [key in keyof TValue]?: DeepPartial<TValue[key]>
}

type Noop = () => void

export type { Primitive, DeepPartial, Noop }
