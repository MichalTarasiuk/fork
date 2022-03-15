import { isAsyncFunction, isPlainObject } from './helpers'
import type { DeepPickByType, AsyncFunction } from '../typings'

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
