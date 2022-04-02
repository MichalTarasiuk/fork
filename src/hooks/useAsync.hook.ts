import { useCallback, useRef } from 'react'

import {
  mapObject,
  findDiffrence,
  isEmpty,
  set,
  isFunction,
  merge,
} from '../helpers/helpers'
import { useRefState, useMerge, useCreation } from '../hooks/hooks'
import type { AsyncFunction } from '../typings/typings'

export type Status = 'idle' | 'loading' | 'success' | 'error'
export type AsyncSlice = Record<
  PropertyKey,
  readonly [() => Promise<unknown>, Status]
>
type Action = 'set' | 'replace'

const initialStatus = 'idle' as Status

export const useAsync = <TObject extends Record<PropertyKey, AsyncFunction>>(
  object: TObject,
  callback: (asyncSlice: AsyncSlice, action: Action) => void
) => {
  type State = typeof state['current']
  const { state, setState, replaceState } = useRefState(
    mapObject(object, () => initialStatus),
    (nextState) => {
      const merged = merge(
        mutations.current,
        nextState,
        (a, b) => [a, b] as const
      )
      callback(merged, 'set')
    }
  )
  const mergeObject = useMerge(object)
  const savedMergeObject = useRef(mergeObject.current)

  const createMutation = useCallback((key: keyof State, fn: AsyncFunction) => {
    const mutation = async () => {
      setState({ [key]: 'loading' as const })

      try {
        const result = await fn()
        setState({ [key]: 'success' as const })

        return result
      } catch {
        setState({ [key]: 'error' as const })
      }
    }

    return mutation
  }, [])

  const mutations = useCreation(
    () =>
      mapObject(mergeObject.current, (key, value) =>
        createMutation(key, value)
      ),
    mergeObject.current
  )

  const diffrence = findDiffrence(mergeObject.current, savedMergeObject.current)

  if (!isEmpty(diffrence)) {
    const nextState = mapObject(set(state.current, diffrence), (_, value) =>
      isFunction(value) ? initialStatus : value
    )
    const replaced = replaceState(nextState)
    const merged = merge(mutations.current, replaced, (a, b) => [a, b] as const)

    callback(merged, 'replace')
    savedMergeObject.current = mergeObject.current
  }

  return {
    get current() {
      return merge(mutations.current, state.current, (a, b) => [a, b] as const)
    },
  }
}
