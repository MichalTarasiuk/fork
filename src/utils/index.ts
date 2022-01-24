export { createObserver } from './observer'
export { isPrimitive } from './isPrimitive'
export { buildOf } from './buildOf'
export { resolveHookState } from './resolveHookState'
export { equals } from './equals'

export const isFunction = <TValue extends Function>(
  value: any
): value is TValue => typeof value === 'function'
export const noop = () => {}
