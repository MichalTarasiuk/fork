/* eslint-disable @typescript-eslint/no-non-null-assertion -- safty assertion  */
import { useMemo, useCallback, useRef } from 'react'

import {
  useFirstMount,
  useListener,
  useUnmount,
  useMount,
  useForce,
} from './hooks/hooks'
import {
  createPluginsManager,
  createObserver,
  createSafeHookCall,
} from './logic/logic'
import { createStore } from './store'
import { filterObject, assign, compose } from './utils/utils'

import type { HookConfig } from './remest.types'
import type { ActionsCreator, Selector, Patch, SetConfig } from './store.types'
import type { ArrowFunction } from './types/types'

const remest = <
  TState extends Record<PropertyKey, unknown>,
  TActions extends Record<PropertyKey, ArrowFunction>
>(
  initialState: TState,
  actionsCreator: ActionsCreator<TState, TActions>
) => {
  const store = createStore(initialState, actionsCreator)
  const pluginsManager = createPluginsManager<TState>()
  const observer = createObserver<TState>()
  const {
    Provider: RemestProvider,
    safeHookCall,
    setProviderBody,
  } = createSafeHookCall('remest')

  pluginsManager.add('observe', (state) => observer.observe(state))

  setProviderBody(() => {
    const force = useForce()

    useMount(() => {
      observer.configure((state) => {
        store.setState(state, { replace: true })

        force()
      })
    })
  })

  const useRemest = safeHookCall(
    <TSelector extends Selector<TState>>(
      selector?: TSelector,
      config: HookConfig<TState, TSelector> = {}
    ) => {
      type Subscriber = ReturnType<typeof store['subscribe']>

      const savedSubscriber = useRef<Subscriber | null>(null)
      const savedListener = useRef((_: TState, __: TState) => {})

      const isFirstMount = useFirstMount()

      if (isFirstMount) {
        savedSubscriber.current = store.subscribe(
          (state, nextState) => savedListener.current(state, nextState),
          selector,
          config.equality
        )
      }

      const actions = savedSubscriber.current!.actions
      const [state, listener] = useListener(initialState, actions, (state) => {
        const pickedPlugins = Object.values(
          filterObject(
            pluginsManager.plugins,
            // @ts-ignore
            (key) => key in config && config[key] === true
          )
        )
        const combinedPlugins = compose(...pickedPlugins)

        return combinedPlugins(state)
      })

      if (isFirstMount) {
        savedListener.current = listener
      }

      useUnmount(() => {
        if (savedSubscriber.current) {
          savedSubscriber.current.unsubscribe()
          savedSubscriber.current = null
        }
      })

      const setState = useCallback(
        (patch: Patch<TState>, config?: SetConfig) => {
          const emitter = savedSubscriber.current!.body

          store.setState(patch, config, emitter)
        },
        []
      )

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
  )

  const { setState, subscribe } = store

  return {
    RemestProvider,
    useRemest,
    setState,
    subscribe,
  }
}

// eslint-disable-next-line import/no-default-export -- library export
export default remest
