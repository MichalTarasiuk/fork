export const pick = <TObject extends Record<string, any>>(
  object: TObject,
  keys?: string[]
) =>
  Object.keys(object)
    .filter((key) => (keys || []).includes(key))
    .reduce((acc, key) => {
      acc[key] = object[key]

      return acc
    }, {} as Record<string, any>)
