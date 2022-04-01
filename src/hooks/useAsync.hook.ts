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

const initialStatus = 'idle' as Status

export const useAsync = <TObject extends Record<PropertyKey, AsyncFunction>>(
  object: TObject,
  callback: (
    asyncActions: Record<PropertyKey, readonly [() => Promise<unknown>, Status]>
  ) => void
) => {
  type State = typeof state['current']
  const { state, setState, replaceState } = useRefState(
    mapObject(object, () => initialStatus),
    (nextState) => {
      callback(merge(mutations, nextState, (a, b) => [a, b] as const))
    }
  )
  const savedObject = useRef(object)
  const diffrence = findDiffrence(object, savedObject.current)

  if (!isEmpty(diffrence)) {
    const nextState = mapObject(set(state.current, diffrence), (_, value) =>
      isFunction(value) ? initialStatus : value
    )

    replaceState(nextState)
  }

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

  return {
    get current() {
      return merge(mutations, state.current, (a, b) => [a, b] as const)
    },
  }
}
