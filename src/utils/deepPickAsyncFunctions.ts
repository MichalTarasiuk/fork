import { isAsyncFunction, isPlainObject } from '../utils'
import type { DeepPickByType, AsyncFunction } from '../types'

export const deepPickAsyncFunctions = <TValue extends Record<string, any>>(
  value: TValue
) =>
  Object.keys(value)
    .filter((key) => isAsyncFunction(value[key]) || isPlainObject(value[key]))
    .reduce<Record<string, any>>((acc, key) => {
      acc[key] = isAsyncFunction(value[key])
        ? value[key]
        : deepPickAsyncFunctions(value[key])

      return acc
    }, {}) as DeepPickByType<TValue, AsyncFunction>
