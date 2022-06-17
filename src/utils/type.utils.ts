import type { PlainObject } from '../types/types'

export const isPlainObject = (value: unknown): value is PlainObject =>
  !!value && typeof value === 'object' && value.constructor === Object
