import type { Primitive } from '../typings'

export const isPrimitive = (value: unknown): value is Primitive =>
  Object(value) !== value
