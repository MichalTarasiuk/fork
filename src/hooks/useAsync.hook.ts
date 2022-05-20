import { useCallback, useMemo } from 'react'

import { useCreation } from '../hooks/hooks'
import { mapObject, merge } from '../utils/utils'

import type { AsyncFunction } from '../types/types'

export type Status = 'idle' | 'loading' | 'success' | 'error'
type Mutation = () => Promise<unknown>

export type AsyncSlice = Record<PropertyKey, readonly [Mutation, Status]>

const initialStatus = 'idle' as Status

const createAsyncState = <TObject extends Record<PropertyKey, AsyncFunction>>(
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

export const useAsync = <TObject extends Record<PropertyKey, AsyncFunction>>(
  object: TObject,
  fn: (asyncSlice: AsyncSlice) => void
) => {
  type Name = keyof TObject
  type State = Record<Name, Status>
  type Mutations = Record<Name, Mutation>

  const { state, setStatus } = useMemo(() => {
    const listener = (nextState: State) => {
      const asyncSlice = createAsyncSlice(nextState, mutations.current)

      fn(asyncSlice)
    }

    return createAsyncState(object, listener)
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

  const createAsyncSlice = useCallback((state: State, mutations: Mutations) => {
    const asyncSlice = merge(
      state,
      mutations,
      (status, mutation) => [mutation, status] as const
    )

    return asyncSlice
  }, [])

  const mutations = useCreation(() => {
    const result = mapObject(object, (name, asyncFunction) =>
      createMutation(name, asyncFunction)
    )

    return result
  }, [object])

  return {
    get asyncSlice() {
      const asyncSlice = createAsyncSlice(state, mutations.current)

      return asyncSlice
    },
  }
}
