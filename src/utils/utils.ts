import type { ArrowFunction } from '../types/types'

export * from './observer.utility'
export * from './resolve.utility'
export * from './entries.utility'
export { assign } from './assign.utility'
export { compose } from './compose.utility'
export { mapObject } from './mapObject.utility'
export { set } from './set.utility'
export { merge } from './merge.utility'
export { empty } from './empty.utility'
export { flatObject } from './flatObject.utility'
export { isNil } from './isNil.utility'
export { filterObject } from './filterObject.utility'
export { split } from './split.utility'
export { createProxy } from './createProxy.utility'
export { createRef } from './createRef.utility'

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