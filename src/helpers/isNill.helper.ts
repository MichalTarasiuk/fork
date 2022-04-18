import type { Nill } from '../typings/typings'

export const isNill = (value: unknown): value is Nill =>
  value === undefined || value === null
