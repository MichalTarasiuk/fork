import { isAsyncFunction, isPlainObject } from '../utils'

export const deepPickAsyncFunctions = (value: Record<string, any>) =>
  Object.keys(value)
    .filter((key) => isAsyncFunction(value[key]) || isPlainObject(value[key]))
    .reduce<Record<string, any>>((acc, key) => {
      acc[key] = isAsyncFunction(value[key])
        ? value[key]
        : deepPickAsyncFunctions(value[key])

      return acc
    }, {})
