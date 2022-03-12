import { useReducer, useCallback, useMemo } from 'react'

import { isAsyncFunction, isPlainObject, getSlugs, set } from '../../src/utils'
import { DeepReplace, AsyncFunction, DeepPickByType } from '../types'
import { Value as Slugs } from '../utils/getSlugs'

type Action = {
  status: Status
  slug: string
}
export type Status = 'idle' | 'success' | 'error' | 'loading'

const getInitialState = <TValue extends Record<string, any>>(value: TValue) =>
  Object.keys(value).reduce<Record<string, any>>((acc, key) => {
    acc[key] = isPlainObject(value[key]) ? getInitialState(value[key]) : 'idle'

    return acc
  }, {})

export const useMultipleFetch = <
  TMind extends Record<PropertyKey, any>,
  TValue extends Record<string, any> = DeepPickByType<TMind, AsyncFunction>,
  TState extends Record<string, any> = DeepReplace<
    TValue,
    AsyncFunction,
    Status
  >
>(
  value: TValue
) => {
  const [state, dispatch] = useReducer(
    (state: TState, { slug, status }: Action) => set(state, slug, status),
    getInitialState(value) as TState
  )

  const createMutations = useCallback(
    (value: TValue, slugs: Slugs) =>
      Object.keys(value).reduce<Record<string, any>>((acc, key) => {
        const valueOfProp = value[key]

        if (!isAsyncFunction(valueOfProp)) {
          acc[key] = createMutations(valueOfProp, slugs) as any
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
    []
  )

  const combaine = useCallback(
    (state: TState, mutations: TValue) =>
      Object.keys(mutations).reduce((acc: Record<string, any>, key) => {
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

  const slugs = useMemo(() => getSlugs(value), [value])
  const mutations = useMemo(() => createMutations(value, slugs), [value, slugs])
  const combined = useMemo(() => combaine(state, mutations), [state, mutations])

  return combined
}
