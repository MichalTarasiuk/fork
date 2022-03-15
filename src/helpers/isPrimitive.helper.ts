import type { Primitive } from '../typings'

export const isPrimitive = (val: unknown): val is Primitive =>
  Object(val) !== val
