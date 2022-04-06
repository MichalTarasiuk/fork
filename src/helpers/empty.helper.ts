import { isPlainObject } from './helpers'

export function empty(value: Record<PropertyKey, unknown>): {}
export function empty(value: Array<unknown>): []

export function empty<
  TValue extends Record<PropertyKey, unknown> | Array<unknown>
>(value: TValue) {
  if (isPlainObject(value)) {
    Object.keys(value).forEach((key) => {
      delete value[key]
    })

    return value
  }

  value.length = 0
  return value
}
