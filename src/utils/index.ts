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

export const noop = () => {}

export const pickKeysByType = <TValue extends Record<string, any>>(
  value: TValue,
  type: any
) => Object.keys(value || {}).filter((key) => value[key] === type)

export const isMessageEvent = (event: any): event is MessageEvent<string> =>
  event.data
