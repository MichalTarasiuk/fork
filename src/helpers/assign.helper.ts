import { isNil } from './helpers'

import type { Nil } from '../types/types'

export function assign<TB>(a: Nil, b: TB): TB
export function assign<TA>(a: TA, b: Nil): TA
export function assign<TA, TB>(a: TA, b: TB): TA & TB

export function assign(a: unknown, b: unknown) {
  if (isNil(a) || isNil(b)) {
    return a || b
  }

  return Object.freeze(Object.assign(a, b))
}
