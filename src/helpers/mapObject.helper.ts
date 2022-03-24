import { fromEntries, entries } from '../helpers/helpers'

export const mapObject = <TObject extends Record<PropertyKey, unknown>, TValue>(
  obj: TObject,
  fn: (key: keyof TObject, value: TObject[keyof TObject]) => TValue
): Record<keyof TObject, TValue> =>
  fromEntries(
    entries(obj).map(([key, value]) => [key, fn(key, value)] as const)
  )
