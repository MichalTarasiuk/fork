import type { ArrowFunction } from '../types/types'

export const isFunction = (value: unknown): value is ArrowFunction =>
  typeof value === 'function'
