import { useReducer, useCallback, useMemo } from 'react'

import { isAsyncFunction, isPlainObject, getSlugs, set } from '../../src/utils'
import { DeepReplace, AsyncFunction, DeepPickByType } from '../types'
import { Value as Slugs } from '../utils/getSlugs'

type Fetchers<TValue> = DeepPickByType<TValue, AsyncFunction>
type Action = {
  status: Status
  slug: string
}
type State<TValue> = DeepReplace<TValue, AsyncFunction, Status>
type Mutations<TValue> = DeepReplace<
  TValue,
  AsyncFunction,
  [AsyncFunction, Status]
>
type Combined<TFetchers> = DeepReplace<
  TFetchers,
  AsyncFunction,
  [AsyncFunction, Status]
>
export type Status = 'idle' | 'success' | 'error' | 'loading'

const getInitialState = (value: Record<string, any>) =>
  Object.keys(value).reduce<Record<string, any>>((acc, key) => {
    acc[key] = isPlainObject(value[key]) ? getInitialState(value[key]) : 'idle'

    return acc
  }, {})

export const useMultipleFetch = <
  TValue extends Record<string, any>,
  TState extends Record<string, any> = State<TValue>,
  TMutations extends Record<string, any> = Mutations<TValue>,
  TFetchers extends Record<string, any> = Fetchers<TValue>
>(
  fetchers: TFetchers
) => {
  const [state, dispatch] = useReducer(
    (state: TState, { slug, status }: Action) => set(state, slug, status),
    getInitialState(fetchers) as TState
  )

  const createMutations = useCallback(
    (fetchers: TFetchers, slugs: Slugs) =>
      Object.keys(fetchers).reduce<Record<string, any>>((acc, key) => {
        const fetcher = fetchers[key]

        if (!isAsyncFunction(fetcher)) {
          acc[key] = createMutations(fetcher, slugs)
          return acc
        }

        const slug = slugs[key]
        const mutation = async () => {
          dispatch({ status: 'loading', slug })

          try {
            const result = await fetcher()
            dispatch({ status: 'success', slug })

            return result
          } catch {
            dispatch({ status: 'error', slug })
          }
        }

        acc[key] = mutation

        return acc
      }, {}) as TMutations,
    []
  )

  const combaine = useCallback(
    (state: TState, mutations: TMutations) =>
      Object.keys(mutations).reduce<Record<string, any>>((acc, key) => {
        const mutation = mutations[key]

        if (!isAsyncFunction(mutation)) {
          acc[key] = combaine(state[key], mutation)
          return acc
        }

        acc[key] = [mutation, state[key]]

        return acc
      }, {}) as Combined<TFetchers>,
    []
  )

  const slugs = useMemo(() => getSlugs(fetchers), [fetchers])
  const mutations = useMemo(
    () => createMutations(fetchers, slugs),
    [fetchers, slugs]
  )
  const combined = useMemo(() => combaine(state, mutations), [state, mutations])

  return combined
}
