import { isPlainObject } from '../helpers/helpers'
import type { DeepReplace } from '../typings'

export const deepReplace = <TObject extends Record<string, any>, TValue>(
  object: TObject,
  value: TValue
) =>
  Object.keys(object).reduce<Record<string, any>>((acc, key) => {
    const currentValue = object[key]

    if (typeof currentValue === 'object') {
      const copy = { ...currentValue }
      const modifiedCopy = deepReplace(copy, value) as any

      acc[key] = isPlainObject(currentValue)
        ? modifiedCopy
        : Array.from({ ...modifiedCopy, length: currentValue.length })

      return acc
    }

    acc[key] = value

    return acc
  }, {}) as DeepReplace<TObject, any, TValue>
