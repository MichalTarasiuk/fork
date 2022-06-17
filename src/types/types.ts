export type AddBy<TObject extends PlainObject, TBy, TNewValue> = {
  readonly [key in keyof TObject]: TObject[key] extends TBy
    ? readonly [TObject[key], TNewValue]
    : TObject[key]
}

export type PlainObject = Record<PropertyKey, unknown>

export type AsyncFunction = (...args: readonly unknown[]) => Promise<unknown>

export type PlainFunction = (...args: readonly any[]) => unknown

export type Noop = () => void
