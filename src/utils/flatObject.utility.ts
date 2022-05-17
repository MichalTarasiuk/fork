import { isPlainObject } from './utils'

// utility mutate the object
export const flatObject = <TObject extends Record<PropertyKey, unknown>>(
  object: TObject,
  ...keys: ReadonlyArray<keyof TObject>
) =>
  keys.reduce((acc, key) => {
    const value = acc[key]

    if (isPlainObject(value)) {
      delete acc[key]

      return Object.assign(acc, value) as TObject
    }

    return acc
  }, object)
