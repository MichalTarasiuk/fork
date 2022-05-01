import { useCallback } from 'react'

import { mapObject, merge } from '../helpers/helpers'
import { usePatch, useCreation } from '../hooks/hooks'

import type { AsyncFunction } from '../types/types'

export type Status = 'idle' | 'loading' | 'success' | 'error'
export type AsyncSlice = Record<
  PropertyKey,
  readonly [() => Promise<unknown>, Status]
>

const initialStatus = 'idle' as Status

export const useAsync = <TObject extends Record<PropertyKey, AsyncFunction>>(
  object: TObject,
  callback: (asyncSlice: AsyncSlice) => void
) => {
  const { state, setState } = usePatch(
    mapObject(object, () => initialStatus),
    (nextState) => {
      const merged = merge(
        mutations.current,
        nextState,
        (a, b) => [a, b] as const
      )

      callback(merged)
    }
  )

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
    () => mapObject(object, (key, value) => createMutation(key, value)),
    object
  )

  return {
    get current() {
      return merge(mutations.current, state.current, (a, b) => [a, b] as const)
    },
  }
}
