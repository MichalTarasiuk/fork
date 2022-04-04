import { isFunction, isPrimitive } from './helpers'

export const pickByValue = <TReturnType extends Record<PropertyKey, unknown>>(
  object: Record<PropertyKey, unknown>,
  value: ((item: unknown) => boolean) | unknown
) =>
  Object.keys(isPrimitive(object) ? {} : object)
    .filter((key) =>
      isFunction(value) ? value(object[key]) : object[key] === value
    )
    .reduce<Record<PropertyKey, unknown>>((acc, key) => {
      acc[key] = object[key]

      return acc
    }, {}) as TReturnType
