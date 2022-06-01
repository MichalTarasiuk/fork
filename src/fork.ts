/* eslint-disable @typescript-eslint/no-non-null-assertion -- safty assertion  */
import { useCallback, useRef } from 'react'

import { useFirstMount, useListener, useUnmount } from './hooks/hooks'
import { createHookControl } from './logic/logic'
import { createStore } from './store'
import { filterObject, compose } from './utils/utils'

import type { Config } from './fork.types'
import type { ActionsCreator, Selector, Patch, SetConfig } from './store.types'
import type { ArrowFunction } from './types/types'

const fork = <
  TState extends Record<PropertyKey, unknown>,
  TActions extends Record<PropertyKey, ArrowFunction>
>(
  initialState: TState,
  actionsCreator?: ActionsCreator<TState, TActions>
) => {
  const store = createStore(initialState, actionsCreator)
  const { Provider, safeHookCall, pluginsManager } = createHookControl(store)

  const useFork = <
    TSelector extends Selector<TState>,
    TConfig extends Config<TState, TSelector>
  >(
    selector?: TSelector,
    config?: TConfig
  ) => {
    const subscriber = useRef<ReturnType<typeof store['subscribe']> | null>(
      null
    )
    const listener = useRef((_: TState, __: TState) => {})

    const isFirstMount = useFirstMount()

    if (isFirstMount) {
      subscriber.current = store.subscribe(
        (state, nextState) => listener.current(state, nextState),
        selector,
        config?.equality
      )
    }

    const actions = subscriber.current?.actions
    const [state, listenerImpl] = useListener(
      initialState,
      actions,
      (state) => {
        if (config) {
          const filteredPlugins = filterObject(
            pluginsManager.plugins,
            // @ts-ignore
            (key) => key in config && config[key] === true
          )
          const pickedPlugins = Object.values(filteredPlugins)
          const combinedPlugins = compose(...pickedPlugins)

          return combinedPlugins(state)
        }

        return state
      }
    )

    if (isFirstMount) {
      listener.current = listenerImpl
    }

    useUnmount(() => {
      tearDown()
    })

    const tearDown = useCallback(() => {
      if (subscriber.current) {
        subscriber.current.unsubscribe()
        subscriber.current = null
      }
    }, [])

    const setState = useCallback((patch: Patch<TState>, config?: SetConfig) => {
      const emitter = subscriber.current?.body

      store.setState(patch, config, emitter)
    }, [])

    return {
      state,
      setState,
    }
  }

  return {
    ForkProvider: Provider,
    useFork: safeHookCall(useFork),
    setState: store.setState,
    subscribe: store.subscribe,
  }
}

// eslint-disable-next-line import/no-default-export -- library export
export default fork
