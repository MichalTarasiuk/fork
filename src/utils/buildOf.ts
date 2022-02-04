import { isPrimitive, cloneObject, isEmpty } from 'src/utils'

export const buildOf = <TValue extends Record<string, any>>(
  value: TValue,
  source: DeepPartial<TValue>
): TValue => {
  const copy = cloneObject(value)
  const shallowSource = { ...source }

  for (const [key, copyValue] of Object.entries(copy)) {
    if (isEmpty(source)) {
      return copy
    }

    const sourceValue = shallowSource[key]

    if (key in shallowSource) {
      (copy[key] as any) = isPrimitive(sourceValue)
        ? sourceValue
        : buildOf(copyValue, sourceValue)

      delete shallowSource[key]
    }
  }

  return copy
}
