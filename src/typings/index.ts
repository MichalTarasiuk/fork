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

export type DeepPickByType<TValue extends Record<string, any>, TType> = {
  [key in keyof TValue as TValue[key] extends TType | Record<string, any>
    ? key
    : never]: DeepPickByType<TValue[key], TType>
}

export type AsyncFunction = (...args: any[]) => Promise<any>

export type DeepAddByValue<TObject, TValue, TNewValue> = {
  [key in keyof TObject]: TObject[key] extends TValue
    ? [TObject[key], TNewValue]
    : TObject[key] extends Function | Array<any> | Primitive
    ? TObject[key]
    : DeepAddByValue<TObject[key], TValue, TNewValue>
}