import { isNil } from '../helpers/helpers'

import type { Nil } from '../types/types'

export function assert<TValue>(
  value: TValue,
  message: string
): asserts value is Exclude<TValue, Nil> {
  if (isNil(value)) {
    throw new Error(message)
  }
}
