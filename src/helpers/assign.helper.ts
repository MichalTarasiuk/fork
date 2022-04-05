import { isNil } from './helpers'
import type { Nill } from '../typings/typings'

export function assign<TB>(a: Nill, b: TB): TB
export function assign<TA>(a: TA, b: Nill): TA
export function assign<TA, TB>(a: TA, b: TB): TA & TB

export function assign(a: unknown, b: unknown) {
  if (isNil(a) || isNil(b)) {
    return a || b
  }

  return Object.freeze(Object.assign(a, b))
}
