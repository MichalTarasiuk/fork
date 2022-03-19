import { isPrimitive, cloneObject } from './helpers'
import type { DeepPartial } from '../typings'

export const buildOf = <TValue extends Record<string, any>>(
  value: TValue,
  source: DeepPartial<TValue>
): TValue => {
  const copy = cloneObject(value)

  for (const [key, sourceValue] of Object.entries(source)) {
    ;(copy[key] as any) =
      isPrimitive(sourceValue) ||
      Array.isArray(sourceValue) ||
      typeof sourceValue === 'function'
        ? sourceValue
        : buildOf(copy[key], sourceValue)
  }

  return copy
}
