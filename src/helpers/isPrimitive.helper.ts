export const isPrimitive = (value: unknown): value is Primitive =>
  Object(value) !== value
