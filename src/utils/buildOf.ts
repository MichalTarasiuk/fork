import { isPrimitive, cloneObject } from 'src/utils'

export const buildOf = <TValue extends Record<string, any>>(
  value: TValue,
  source: DeepPartial<TValue>
): TValue =>
  Object.keys(value).reduce((accumulator, key) => {
    const nestedSource = source[key]
    const nestedAcc = accumulator[key]

    if (key in source && nestedSource) {
      ;(accumulator[key] as any) = isPrimitive(nestedAcc)
        ? nestedSource
        : buildOf(nestedAcc, nestedSource)
    }

    return accumulator
  }, cloneObject(value))
