export * from './observer'
export { isPrimitive } from './isPrimitive'
export { buildOf } from './buildOf'
export * from './resolveState'
export { equals } from './equals'
export { cloneObject } from './cloneObject'

export const isFunction = <TValue extends Function>(
  value: any
): value is TValue => typeof value === 'function'

export const noop = () => {}

export const random = <TValue extends any>(arr: TValue[]): TValue =>
  arr[Math.floor(Math.random() * arr.length)]

export const isNotSetter = (key: string) => !key.startsWith('set')

type Middleware = (value?: any) => { next: boolean; value: any }
export const isMiddleware = (key: string, value: any): value is Middleware =>
  isNotSetter(key) && isFunction(value)
