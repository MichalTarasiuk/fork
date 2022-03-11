export type DeepPickByType<TValue extends Record<string, any>, TType> = {
  [key in keyof TValue as TValue[key] extends TType | Record<string, any>
    ? key
    : never]: DeepPickByType<TValue[key], TType>
}

export type AsyncFunction = (...args: any[]) => Promise<any>

export type DeepReplace<TValue, TFrom, TTo> = {
  [key in keyof TValue]: TValue[key] extends TFrom
    ? TTo
    : TValue[key] extends object
    ? TValue[key] extends Function
      ? TValue[key]
      : TValue extends Array<any>
      ? TValue[key]
      : DeepReplace<TValue[key], TFrom, TTo>
    : TValue[key]
}
