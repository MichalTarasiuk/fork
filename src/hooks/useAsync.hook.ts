import { useRef, useCallback, useMemo } from 'react'

import {
  getSlugs,
  set,
  deepReplace,
  isPlainObject,
  equals,
  mergeFactory,
} from '../helpers/helpers'
import { AsyncFunction, DeepPickByType, DeepAddByValue } from '../typings'

type FetchersMap<TValue> = DeepPickByType<TValue, AsyncFunction>
type Slugs = Record<string, any>
export type Status = 'idle' | 'success' | 'error' | 'loading'

const myMerge = mergeFactory(
  (a, b) => !(isPlainObject(a) && isPlainObject(b) && equals(a, b))
)

export const useAsync = <
  TValue,
  TFetchersMap extends Record<string, any> = FetchersMap<TValue>
>(
  fetchersMap: TFetchersMap
) => {
  const state = useRef(deepReplace(fetchersMap, 'idle' as Status))

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
          state.current = set(state.current, slug, 'loading')

          try {
            const result = await fetcher()
            state.current = set(state.current, slug, 'success')

            return result
          } catch {
            state.current = set(state.current, slug, 'error')
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

  return {
    get current() {
      return myMerge<DeepAddByValue<TFetchersMap, AsyncFunction, Status>>(
        mutations,
        state.current,
        (mutation: AsyncFunction, status: Status) => [mutation, status]
      )
    },
  }
}
