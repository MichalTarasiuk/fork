import { isPlainObject } from './utils'

// utility mutate the object
export const flatObject = <TObject extends Record<PropertyKey, unknown>>(
  object: TObject,
  ...keys: ReadonlyArray<keyof TObject>
) =>
  keys.reduce((collector, key) => {
    const value = collector[key]

    if (isPlainObject(value)) {
      delete collector[key]

      return Object.assign(collector, value) as TObject
    }

    return collector
  }, object)
