export * from './observer'
export { isPrimitive } from './isPrimitive'
export { buildOf } from './buildOf'
export * from './resolveState'
export { equals } from './equals'
export { cloneObject } from './cloneObject'
export { isMiddleware } from './isMiddleware'
export { merge } from './merge'

export const isFunction = <TValue extends Function>(
  value: any
): value is TValue => typeof value === 'function'
