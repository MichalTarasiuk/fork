import { useMemo, useCallback, useRef } from 'react'
import { unstable_batchedUpdates } from 'react-dom'

import { filterObject, assign, compose } from './helpers/helpers'
import { useFirstMount, useListener, useDidUnmount } from './hooks/hooks'
import { getPlugins } from './logic/logic'
import { createStore } from './store'
import type { ActionsCreator, Selector, Patch, SetConfig } from './store.types'
import type { HookConfig } from './remind.types'

const remind = <
  TState extends Record<PropertyKey, unknown>,
  TActions extends Record<PropertyKey, Function>
>(
  initialState: TState,
  actionsCreator: ActionsCreator<TState, TActions>
) => {
  const store = createStore(initialState, actionsCreator)
  const plugins = getPlugins(store)

  const useRemind = <TSelector extends Selector<TState>>(
    selector?: TSelector,
    config: HookConfig<TState, TSelector> = {}
  ) => {
    const subscriber = useRef<ReturnType<typeof store['subscribe']> | null>(
      null
    )
    const mockListener = useRef((_: TState, __: TState) => {})

    const isFirstMount = useFirstMount()

    if (isFirstMount) {
      subscriber.current = store.subscribe(
        (state, nextState) => mockListener.current(state, nextState),
        selector,
        config.equality
      )
    }

    const savedSubscriber = subscriber.current!
    const actions = savedSubscriber.actions

    const [mind, listener] = useListener(
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
      mockListener.current = listener
    }

    useDidUnmount(() => {
      if (savedSubscriber) {
        savedSubscriber.unsubscribe()
        subscriber.current = null
      }
    })

    const setMind = useCallback((patch: Patch<TState>, config?: SetConfig) => {
      const emitter = savedSubscriber.body

      store.setState(patch, config, emitter)
    }, [])

    const result = useMemo(
      () => ({
        mind,
        setMind,
        unsubscribe: savedSubscriber.unsubscribe,
      }),
      [mind]
    )

    return assign([result.mind, result.setMind] as const, result)
  }

  const setMind = (...params: Parameters<typeof store['setState']>) => {
    unstable_batchedUpdates(() => {
      store.setState(...params)
    })
  }

  return { setMind, useRemind, subscribe: store.subscribe }
}

export default remind
