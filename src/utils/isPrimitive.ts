import type { Primitive } from 'src/typings'

export const isPrimitive = (val: unknown): val is Primitive =>
  Object(val) !== val
