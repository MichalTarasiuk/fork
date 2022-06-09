import { useCallback, useMemo } from 'react'

import { mapObject, merge } from '../utils/utils'

import { useCreation } from './hooks'

import type { AsyncFunction } from '../types/types'

export type Status = 'idle' | 'loading' | 'success' | 'error'

export type Mutations = Record<PropertyKey, readonly [AsyncFunction, Status]>

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

export const useAsync = <TObject extends Record<PropertyKey, AsyncFunction>>(
  object: TObject,
  fn: (mutations: Mutations) => void
) => {
  const { state, setStatus } = useMemo(() => {
    const listener = (nextState: Record<keyof TObject, Status>) => {
      const mutations = createMutations(nextState, actions.current)

      fn(mutations)
    }

    return createState(object, listener)
  }, [])

  const createAction = useCallback(
    (name: keyof TObject, actionImpl: AsyncFunction) => {
      const action = async () => {
        setStatus(name, 'loading')

        try {
          const data = await actionImpl()

          setStatus(name, 'success')

          return data
        } catch {
          setStatus(name, 'error')
        }
      }

      return action
    },
    []
  )

  const createMutations = useCallback(
    (
      state: Record<keyof TObject, Status>,
      actions: Record<keyof TObject, AsyncFunction>
    ) => {
      const mutations = merge(
        state,
        actions,
        (status, action) => [action, status] as const
      )

      return mutations
    },
    []
  )

  const actions = useCreation(() => {
    const result = mapObject(object, (name, asyncFunction) =>
      createAction(name, asyncFunction)
    )

    return result
  }, [object])

  return useMemo(() => createMutations(state, actions.current), [])
}
