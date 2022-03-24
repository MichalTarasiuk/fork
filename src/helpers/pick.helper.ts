export const pick = <TObject extends Record<PropertyKey, unknown>>(
  object: TObject,
  keys?: string[]
) =>
  Object.keys(object)
    .filter((key) => (keys || []).includes(key))
    .reduce<Record<PropertyKey, unknown>>((acc, key) => {
      acc[key] = object[key]

      return acc
    }, {}) as TObject
