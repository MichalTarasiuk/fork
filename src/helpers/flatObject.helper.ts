import { isPlainObject } from './helpers'

export const flatObject = <TObject extends Record<PropertyKey, unknown>>(
  object: TObject,
  key: keyof TObject
) => {
  const { [key]: a, ...b } = object

  if (isPlainObject(a)) {
    return {
      ...a,
      ...b,
    }
  }

  return object
}
