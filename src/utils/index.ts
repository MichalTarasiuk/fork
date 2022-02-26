export * from './observer'
export { isPrimitive } from './isPrimitive'
export { buildOf } from './buildOf'
export * from './resolveState'
export { equals } from './equals'
export { cloneObject } from './cloneObject'
export * from './middleware'
export { merge } from './merge'
export { watch } from './watch'

export const isFunction = <TValue extends Function>(
  value: any
): value is TValue => typeof value === 'function'

export const pick = <TObject extends Record<string, any>>(
  object: TObject,
  keys: string[]
) =>
  Object.keys(object)
    .filter((key) => keys.includes(key))
    .reduce((acc, key) => {
      acc[key] = object[key]

      return acc
    }, {} as Record<string, any>)

export const compose = (...funcs: Function[]) => {
  if (funcs.length === 0) {
    // infer the argument type so it is usable in inference down the line
    return <TArg>(arg: TArg) => arg
  }

  if (funcs.length === 1) {
    return funcs[0]
  }

  return funcs.reduce((a, b) => {
    return (...args: any) => a(b(...args))
  })
}
