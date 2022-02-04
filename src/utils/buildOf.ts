import { isPrimitive, cloneObject, isEmpty } from 'src/utils'

export const buildOf = <TValue extends Record<string, any>>(
  value: TValue,
  source: DeepPartial<TValue>
): TValue => {
  const copy = cloneObject(value)
  const shallowSource = { ...source }

  for (const [key, copyValue] of Object.entries(copy)) {
    if (isEmpty(shallowSource)) {
      return copy
    }

    const sourceValue = shallowSource[key]

    if (key in shallowSource) {
      if(isPrimitive(sourceValue)) {
        (copy[key] as any) = sourceValue
      } else {
        (copy[key] as any) = buildOf(copyValue, sourceValue)
      }

      delete shallowSource[key]
    }
  }

  return copy
}
