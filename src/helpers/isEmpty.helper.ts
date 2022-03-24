export const isEmpty = (value: unknown) =>
  value && typeof value === 'object' && Object.keys(value).length === 0
