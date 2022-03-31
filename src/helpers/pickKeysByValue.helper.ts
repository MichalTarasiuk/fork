export const pickKeysByValue = (
  object: Record<PropertyKey, unknown>,
  value: unknown
) => Object.keys(object || {}).filter((key) => object[key] === value)
