import { isPrimitive, cloneObject } from 'src/utils'

export const buildOf = <TValue extends Record<string, any>>(
  value: TValue,
  source: DeepPartial<TValue>
): TValue => {
  const copy = cloneObject(value)
  const shallowSource = { ...source }

  for (const [key, sourceValue] of Object.entries(shallowSource)) {
    (copy[key] as any) =
      isPrimitive(sourceValue) || Array.isArray(sourceValue)
        ? sourceValue
        : buildOf(copy[key], sourceValue)
  }

  return copy
}
