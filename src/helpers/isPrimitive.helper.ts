import type { Primitive } from '../typings/typings'

export const isPrimitive = (value: unknown): value is Primitive =>
  Object(value) !== value
