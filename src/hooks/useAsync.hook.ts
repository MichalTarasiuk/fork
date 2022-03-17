import { useReducer, useCallback, useMemo } from 'react'

import {
  getSlugs,
  set,
  deepReplace,
  isPlainObject,
  equals,
  mergeFactory,
} from '../helpers/helpers'
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
type FetchersMap<TValue> = DeepPickByType<TValue, AsyncFunction>
type Slugs = Record<string, any>
export type Status = 'idle' | 'success' | 'error' | 'loading'

const myMerge = mergeFactory(
  (a, b) => !(isPlainObject(a) && isPlainObject(b) && equals(a, b))
)

export const useAsync = <
  TValue,
  TFetchersMap extends Record<string, any> = FetchersMap<TValue>,
  TState extends Record<string, any> = DeepReplace<TFetchersMap, any, Status>
>(
  fetchersMap: TFetchersMap
) => {
  const [state, dispatch] = useReducer(
    (state: TState, { slug, status }: Action) => set(state, slug, status),
    deepReplace(fetchersMap, 'idle' as Status) as TState
  )

  const createMutations = useCallback(
    (fetchersMap: TFetchersMap, slugs: Slugs) =>
      Object.keys(fetchersMap).reduce<Record<string, any>>((acc, key) => {
        if (isPlainObject(fetchersMap[key])) {
          acc[key] = createMutations(fetchersMap[key], slugs)
          return acc
        }

        const fetcher = fetchersMap[key]
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
      }, {}) as TFetchersMap,
    []
  )

  const slugs = useMemo(() => getSlugs(fetchersMap), [fetchersMap])
  const mutations = useMemo(
    () => createMutations(fetchersMap, slugs),
    [fetchersMap, slugs]
  )

  return useMemo(
    () =>
      myMerge<DeepAddByValue<TFetchersMap, AsyncFunction, Status>>(
        mutations,
        state,
        (mutation: AsyncFunction, status: Status) => [mutation, status]
      ),
    [mutations, state]
  )
}
