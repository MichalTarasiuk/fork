import { useCallback, useRef, useMemo } from 'react'

import {
  mapObject,
  findDiffrence,
  isEmpty,
  set,
  isFunction,
  merge,
  pickByValue,
  isAsyncFunction,
} from '../helpers/helpers'
import { useRefState, useCreation } from '../hooks/hooks'
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
  const filteredObject = useMemo(
    () => pickByValue<TObject>(object, isAsyncFunction),
    [object]
  )
  const { state, setState, replaceState } = useRefState(
    mapObject(filteredObject, () => initialStatus),
    (nextState) => {
      const merged = merge(
        mutations.current,
        nextState,
        (a, b) => [a, b] as const
      )
      callback(merged, 'set')
    }
  )
  const savedObject = useRef(filteredObject)

  const createMutation = useCallback((key: PropertyKey, fn: AsyncFunction) => {
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
    () => mapObject(filteredObject, (key, value) => createMutation(key, value)),
    filteredObject
  )

  const diffrence = findDiffrence(filteredObject, savedObject.current)

  if (!isEmpty(diffrence)) {
    const nextState = mapObject(set(state.current, diffrence), (_, value) =>
      isFunction(value) ? initialStatus : value
    )
    const replaced = replaceState(nextState)
    const merged = merge(mutations.current, replaced, (a, b) => [a, b] as const)

    callback(merged, 'replace')
    savedObject.current = object
  }

  return {
    get current() {
      return merge(mutations.current, state.current, (a, b) => [a, b] as const)
    },
  }
}
