export * from './observer'
export { isPrimitive } from './isPrimitive'
export { buildOf } from './buildOf'
export * from './resolveState'
export { equals } from './equals'
export { cloneObject } from './cloneObject'
export * from './middleware'
export { merge } from './merge'
export { follow } from './follow'

export const isFunction = <TValue extends Function>(
  value: any
): value is TValue => typeof value === 'function'
