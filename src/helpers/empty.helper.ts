import { isPlainObject } from './helpers'

import type { EmptyArray, EmptyObject } from '../types/types'

export function empty(value: Record<PropertyKey, unknown>): EmptyArray
export function empty(value: ReadonlyArray<unknown>): EmptyObject

export function empty(
  value: Record<PropertyKey, unknown> | ReadonlyArray<unknown>
) {
  if (isPlainObject(value)) {
    Object.keys(value).forEach((key) => {
      delete value[key]
    })

    return value
  }

  value.slice(0, value.length)

  return value
}
