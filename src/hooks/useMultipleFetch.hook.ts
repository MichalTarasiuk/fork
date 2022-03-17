import { useReducer, useCallback, useMemo } from 'react'

import { isAsyncFunction, getSlugs, set, deepReplace } from '../helpers/helpers'
import {
  DeepReplace,
  AsyncFunction,
  DeepPickByType,
  DeepAddByValue,
} from '../typings'

type Action = {
  status: Status
  slug: string
}
type Fetchers<TValue> = DeepPickByType<TValue, AsyncFunction>
type Slugs = Record<string, any>
export type Status = 'idle' | 'success' | 'error' | 'loading'

export const useMultipleFetch = <
  TValue,
  TFetchers extends Record<string, any> = Fetchers<TValue>,
  TState extends Record<string, any> = DeepReplace<TFetchers, any, Status>
>(
  fetchers: TFetchers
) => {
  const [state, dispatch] = useReducer(
    (state: TState, { slug, status }: Action) => set(state, slug, status),
    deepReplace(fetchers, 'idle' as Status) as TState
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
      }, {}) as TFetchers,
    []
  )

  const combaine = useCallback(
    (state: TState, fetchers: TFetchers) =>
      Object.keys(fetchers).reduce<Record<string, any>>((acc, key) => {
        const fetcher = fetchers[key]

        if (!isAsyncFunction(fetcher)) {
          acc[key] = combaine(state[key], fetcher)
          return acc
        }

        acc[key] = [fetcher, state[key]]

        return acc
      }, {}) as DeepAddByValue<TFetchers, AsyncFunction, Status>,
    []
  )

  const slugs = useMemo(() => getSlugs(fetchers), [fetchers])
  const mutations = useMemo(
    () => createMutations(fetchers, slugs),
    [fetchers, slugs]
  )

  return useMemo(() => combaine(state, mutations), [state, mutations])
}
