import { useCallback, useMemo, useRef } from 'react'

import {
  mapObject,
  findDiffrence,
  isEmpty,
  set,
  isFunction,
} from '../helpers/helpers'
import { useRefState } from '../hooks/hooks'
import type { PickByValue, AsyncFunction, AddByValue } from '../typings'

export type Status = 'idle' | 'loading' | 'success' | 'error'

const merge = <
  TA extends Record<PropertyKey, any>,
  TB extends Record<PropertyKey, any>,
  TReturnType
>(
  a: TA,
  b: TB,
  fn: (a: TA[keyof TA], b: TB[keyof TB]) => TReturnType
) => {
  const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])]

  return keys.reduce<Record<PropertyKey, TReturnType>>((acc, key) => {
    acc[key] = fn(a[key], b[key])

    return acc
  }, {})
}

export const useAsync = <
  TPlainState extends Record<PropertyKey, unknown>,
  TObject extends Record<PropertyKey, unknown> = PickByValue<
    TPlainState,
    AsyncFunction
  >,
  TAsyncActions extends Record<PropertyKey, unknown> = AddByValue<
    TObject,
    AsyncFunction,
    Status
  >
>(
  object: TObject,
  callback: (asyncActions: TAsyncActions) => void
) => {
  type State = typeof state['current']
  const { state, setState, replaceState } = useRefState(
    mapObject<TObject, Status>(object, () => 'idle'),
    (nextState) => {
      callback(merge(mutations, nextState, (a, b) => [a, b]) as TAsyncActions)
    }
  )
  const savedObject = useRef(object)
  const diffrence = findDiffrence(object, savedObject.current)

  if (!isEmpty(diffrence)) {
    const nextState = mapObject(set(state.current, diffrence), (_, value) =>
      isFunction(value) ? 'idle' : value
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
    () =>
      mapObject<TObject, AsyncFunction>(object, (key, value) =>
        createMutation(key, value as AsyncFunction)
      ),
    [object]
  )

  return {
    get current() {
      return merge(mutations, state.current, (a, b) => [a, b]) as TAsyncActions
    },
  }
}
