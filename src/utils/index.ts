export * from './observer'
export * from './resolveState'
export * from './middleware'
export { isPrimitive } from './isPrimitive'
export { buildOf } from './buildOf'
export { equals } from './equals'
export { cloneObject } from './cloneObject'
export { merge } from './merge'
export { watch } from './watch'
export { isFunction } from './isFunction'
export { pick } from './pick'
export { compose } from './compose'
export { pickKeysByType } from './pickKeysByType'
export { isStateMap } from './isStateMap'
export { isAsyncFunction } from './isAsyncFunction'
export { deepPickAsyncFunctions } from './deepPickAsyncFunctions'
export { getSlugs } from './getSlugs'

export const noop = () => {}

export const isMessageEvent = (
  event: any,
  callback: (data: string) => any
): event is MessageEvent<string> => event.data && callback(event.data)

export const isPlainObject = (value: any) =>
  value !== null && typeof value === 'object' && value.constructor === Object
