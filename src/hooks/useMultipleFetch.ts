import { useReducer, useCallback, useMemo } from 'react'

import { isAsyncFunction, isPlainObject, getSlugs, set } from '../../src/utils'
import { DeepReplace, AsyncFunction, DeepPickByType } from '../types'

type Action = {
  status: Status
  slug: string
}
export type Status = 'idle' | 'success' | 'error' | 'loading'

const getInitialState = <TValue extends Record<string, any>>(value: TValue) =>
  Object.keys(value).reduce<Record<string, any>>((acc, key) => {
    acc[key] = isPlainObject(acc[key]) ? getInitialState(acc[key]) : 'idle'

    return acc
  }, {})

export const useMultipleFetch = <
  TMind extends Record<PropertyKey, any>,
  TValue = DeepPickByType<TMind, AsyncFunction>,
  TState = DeepReplace<TValue, AsyncFunction, Status>
>(
  value: TValue
) => {
  const [state, dispatch] = useReducer(
    (state: TState, { slug, status }: Action) => set(state, slug, status),
    getInitialState(value) as TState
  )

  const slugs = useMemo(() => getSlugs(value), [value])

  const createMutations = useCallback(
    (value) =>
      Object.keys(value).reduce<Record<string, any>>((acc, key) => {
        const valueOfProp = value[key]

        if (!isAsyncFunction(valueOfProp)) {
          acc[key] = createMutations(valueOfProp) as any
          return acc
        }

        const slug = slugs[key]
        const mutation = async () => {
          dispatch({ status: 'loading', slug })

          try {
            dispatch({ status: 'success', slug })
            const result = await valueOfProp()

            return result
          } catch {
            dispatch({ status: 'error', slug })
          }
        }

        acc[key] = mutation

        return acc
      }, {}) as TValue,
    [slugs]
  )

  const mutations = useMemo(() => createMutations(value), [value])

  const combaine = useCallback(
    (state, mutations) =>
      Object.keys(state).reduce((acc: Record<string, any>, key) => {
        const mutation = mutations[key]

        if (!isAsyncFunction(mutation)) {
          acc[key] = combaine(state[key], mutation)
          return acc
        }

        acc[key] = [mutation, state[key]]

        return acc
      }, {}) as DeepReplace<TValue, AsyncFunction, [Status, AsyncFunction]>,
    []
  )

  return combaine(state, mutations)
}
