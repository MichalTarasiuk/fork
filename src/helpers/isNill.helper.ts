import type { Nill } from '../typings/typings'

export const isNil = (value: unknown): value is Nill =>
  value === undefined || value === null
