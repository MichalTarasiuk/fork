import type { ArrowFunction, Nil } from '../types/types'

export * from './createSubject.utility'
export * from './resolve.utility'
export { compose } from './compose.utility'
export { merge } from './merge.utility'
export { empty } from './empty.utility'
export { flatObject } from './flatObject.utility'
export { partition } from './partition.utility'
export * from './object.utils'

export const noop = () => {}

export const isSymbol = (value: unknown): value is Symbol =>
  typeof value === 'symbol'

export const isPlainObject = (
  value: unknown
): value is Record<PropertyKey, unknown> =>
  !!value && typeof value === 'object' && value.constructor === Object

export const isAsyncFunction = (value: unknown): value is Promise<unknown> =>
  Object.prototype.toString.call(value) === '[object AsyncFunction]'

export const isFunction = (value: unknown): value is ArrowFunction =>
  typeof value === 'function'

export const isNil = (value: unknown): value is Nil =>
  value === undefined || value === null
