/* eslint-disable @typescript-eslint/no-non-null-assertion -- safty assertion  */
import { useMemo, useCallback, useRef } from 'react'

import { filterObject, assign, compose } from './helpers/helpers'
import { useFirstMount, useListener, useUnmount } from './hooks/hooks'
import { createPlugins } from './logic/logic'
import { createStore } from './store'

import type { HookConfig } from './hooray.types'
import type { ActionsCreator, Selector, Patch, SetConfig } from './store.types'
import type { ArrowFunction } from './types/types'

const hooray = <
  TState extends Record<PropertyKey, unknown>,
  TActions extends Record<PropertyKey, ArrowFunction>
>(
  initialState: TState,
  actionsCreator: ActionsCreator<TState, TActions>
) => {
  const store = createStore(initialState, actionsCreator)
  const plugins = createPlugins(store)

  const { setState: setStateInner, subscribe } = store

  const useHooray = <TSelector extends Selector<TState>>(
    selector?: TSelector,
    config: HookConfig<TState, TSelector> = {}
  ) => {
    const savedSubscriber = useRef<ReturnType<
      typeof store['subscribe']
    > | null>(null)
    const savedListener = useRef((_: TState, __: TState) => {})

    const isFirstMount = useFirstMount()

    if (isFirstMount) {
      savedSubscriber.current = subscribe(
        (state, nextState) => savedListener.current(state, nextState),
        selector,
        config.equality
      )
    }

    const actions = savedSubscriber.current!.actions
    const [state, listener] = useListener(
      initialState,
      actions,
      (state, nextState) => {
        const pickedPlugins = Object.values(
          filterObject(plugins, (key) => config[key] === true)
        )
        // @ts-ignore
        const combinedPlugins = compose(...pickedPlugins)

        return combinedPlugins({ state, nextState }).nextState
      }
    )

    if (isFirstMount) {
      savedListener.current = listener
    }

    useUnmount(() => {
      if (savedSubscriber.current) {
        savedSubscriber.current.unsubscribe()
        savedSubscriber.current = null
      }
    })

    const setState = useCallback((patch: Patch<TState>, config?: SetConfig) => {
      const emitter = savedSubscriber.current!.body

      setStateInner(patch, config, emitter)
    }, [])

    const result = useMemo(
      () => ({
        state,
        setState,
        unsubscribe: savedSubscriber.current!.unsubscribe,
      }),
      [state]
    )

    return assign([result.state, result.setState] as const, result)
  }

  return { setState: setStateInner, subscribe, useHooray }
}

// eslint-disable-next-line import/no-default-export -- library export
export default hooray
