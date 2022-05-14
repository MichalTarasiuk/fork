import type { Nil } from '../types/types'

export const isNil = (value: unknown): value is Nil =>
  value === undefined || value === null
