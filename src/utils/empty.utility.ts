/* eslint-disable functional/prefer-readonly-type -- empty helper mutates */
import { isPlainObject } from './utils'

import type { EmptyObject } from '../types/types'

export function empty(value: Record<PropertyKey, unknown>): Array<never>
export function empty(value: Array<unknown>): EmptyObject

// utility mutate the object
export function empty(value: Record<PropertyKey, unknown> | Array<unknown>) {
  if (isPlainObject(value)) {
    Object.keys(value).forEach((key) => {
      delete value[key]
    })

    return value
  }

  value.splice(0, value.length)

  return value
}
