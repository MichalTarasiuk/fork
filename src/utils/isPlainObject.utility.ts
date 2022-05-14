export const isPlainObject = (
  value: unknown
): value is Record<PropertyKey, unknown> =>
  !!value && typeof value === 'object' && value.constructor === Object
