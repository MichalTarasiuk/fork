export { createObserver } from './observer'
export { isPrimitive } from './isPrimitive'
export { buildOf } from './buildOf'
export { resolveHookState } from './resolveHookState'
export { equals } from './equals'
export { cloneObject } from './cloneObject'

export const isFunction = <TValue extends Function>(
  value: any
): value is TValue => typeof value === 'function'
export const noop = () => {}
export const random = <TValue extends any>(arr: TValue[]): TValue =>
  arr[Math.floor(Math.random() * arr.length)]
