/* eslint-disable @typescript-eslint/no-non-null-assertion -- safty assertion  */
import { useMemo, useCallback, useRef } from 'react'

import {
  useFirstMount,
  useListener,
  useUnmount,
  useMount,
  useForce,
} from './hooks/hooks'
import { createPluginsManager, createObserver } from './logic/logic'
import { createStore } from './store'
import { filterObject, assign, compose } from './utils/utils'

import type { HookConfig } from './hooray.types'
import type { ActionsCreator, Selector, Patch, SetConfig } from './store.types'
import type { ArrowFunction } from './types/types'
import type { ReactNode } from 'react'

const hooray = <
  TState extends Record<PropertyKey, unknown>,
  TActions extends Record<PropertyKey, ArrowFunction>
>(
  initialState: TState,
  actionsCreator: ActionsCreator<TState, TActions>
) => {
  const store = createStore(initialState, actionsCreator)
  const pluginsManager = createPluginsManager<TState>()
  const observer = createObserver<TState>()

  const { setState: setStateInner, subscribe } = store

  pluginsManager.add('observe', (stateMap) => {
    observer.observe(stateMap.nextState)

    return stateMap
  })

  const HoorayProvider = ({ children }: { readonly children: ReactNode }) => {
    const force = useForce()

    useMount(() => {
      observer.configure((state) => {
        store.setState(state, { replace: true })

        force()
      })
    })

    return <>{children}</>
  }

  const useHooray = <TSelector extends Selector<TState>>(
    selector?: TSelector,
    config: HookConfig<TState, TSelector> = {}
  ) => {
    type Subscriber = ReturnType<typeof store['subscribe']>

    const savedSubscriber = useRef<Subscriber | null>(null)
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
          filterObject(
            pluginsManager.plugins,
            // @ts-ignore
            (key) => key in config && config[key] === true
          )
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

  return { HoorayProvider, useHooray, setState: setStateInner, subscribe }
}

// eslint-disable-next-line import/no-default-export -- library export
export default hooray