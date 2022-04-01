import { useCallback, useMemo, useRef } from 'react'

import {
  mapObject,
  findDiffrence,
  isEmpty,
  set,
  isFunction,
  merge,
} from '../helpers/helpers'
import { useRefState } from '../hooks/hooks'
import type { AsyncFunction } from '../typings/typings'

export type Status = 'idle' | 'loading' | 'success' | 'error'
type MutationsMap = Record<
  PropertyKey,
  readonly [() => Promise<unknown>, Status]
>
type Action = 'set' | 'replace'

const initialStatus = 'idle' as Status

export const useAsync = <TObject extends Record<PropertyKey, AsyncFunction>>(
  object: TObject,
  callback: (asyncSlice: MutationsMap, action: Action) => void
) => {
  type State = typeof state['current']
  const { state, setState, replaceState } = useRefState(
    mapObject(object, () => initialStatus),
    (nextState) => {
      const merged = merge(mutations, nextState, (a, b) => [a, b] as const)
      callback(merged, 'set')
    }
  )
  const savedObject = useRef(object)
  const diffrence = findDiffrence(object, savedObject.current)

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

  const mutations = useMemo(
    () => mapObject(object, (key, value) => createMutation(key, value)),
    [object]
  )

  if (!isEmpty(diffrence)) {
    const nextState = mapObject(set(state.current, diffrence), (_, value) =>
      isFunction(value) ? initialStatus : value
    )

    const replaced = replaceState(nextState)
    const merged = merge(mutations, replaced, (a, b) => [a, b] as const)
    callback(merged, 'replace')
  }

  return {
    get current() {
      return merge(mutations, state.current, (a, b) => [a, b] as const)
    },
  }
}
