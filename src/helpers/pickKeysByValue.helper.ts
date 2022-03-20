export const pickKeysByValue = <TValue extends Record<PropertyKey, unknown>>(
  object: TValue,
  value: unknown
) => Object.keys(object).filter((key) => object[key] === value)
