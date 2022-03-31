export const hasIterator = (value: unknown) =>
  typeof value === 'object' && value !== null && Symbol.iterator in value
