import { useCallback, useMemo } from 'react'

import { mapObject, merge } from '../utils/utils'

import { useCreation } from './hooks'

import type { AsyncFunction } from '../types/types'

export type Status = 'idle' | 'loading' | 'success' | 'error'
type Mutation = () => Promise<unknown>

export type MultipleMutations = Record<PropertyKey, readonly [Mutation, Status]>

const initialStatus = 'idle' as Status

const createState = <TObject extends Record<PropertyKey, AsyncFunction>>(
  object: TObject,
  fn: (state: Record<keyof TObject, Status>) => void
) => {
  const state = mapObject(object, () => initialStatus)

  const setStatus = (name: keyof TObject, status: Status) => {
    state[name] = status

    fn(state)
  }

  return {
    state,
    setStatus,
  }
}

export const useMultipleMutations = <
  TObject extends Record<PropertyKey, AsyncFunction>
>(
  object: TObject,
  fn: (multipleMutations: MultipleMutations) => void
) => {
  type Name = keyof TObject

  const { state, setStatus } = useMemo(() => {
    const listener = (nextState: Record<keyof TObject, Status>) => {
      const multipleMutations = createMultipleMutations(
        nextState,
        mutations.current
      )

      fn(multipleMutations)
    }

    return createState(object, listener)
  }, [])

  const createMutation = useCallback(
    (name: Name, asyncFunction: AsyncFunction) => {
      const mutation = async () => {
        setStatus(name, 'loading')

        try {
          const result = await asyncFunction()

          setStatus(name, 'success')

          return result
        } catch {
          setStatus(name, 'error')
        }
      }

      return mutation
    },
    []
  )

  const createMultipleMutations = useCallback(
    (state: Record<Name, Status>, mutations: Record<Name, Mutation>) => {
      const multipleMutations = merge(
        state,
        mutations,
        (status, mutation) => [mutation, status] as const
      )

      return multipleMutations
    },
    []
  )

  const mutations = useCreation(() => {
    const result = mapObject(object, (name, asyncFunction) =>
      createMutation(name, asyncFunction)
    )

    return result
  }, [object])

  return useMemo(() => createMultipleMutations(state, mutations.current), [])
}
