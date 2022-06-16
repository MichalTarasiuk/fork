import type { PlainObject } from '../types/types'

export const isPlainObject = (value: unknown): value is PlainObject =>
  !!value && typeof value === 'object' && value.constructor === Object

export const isAsyncFunction = (value: unknown): value is Promise<unknown> =>
  Object.prototype.toString.call(value) === '[object AsyncFunction]'
