export const isEmpty = (value: unknown) =>
  value !== null && typeof value === 'object' && Object.keys(value).length === 0
