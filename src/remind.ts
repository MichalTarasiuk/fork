import { useMemo, useCallback, useRef } from 'react'

import { filterObject, assign, compose, assert } from './helpers/helpers'
import { useFirstMount, useListener, useDidUnmount } from './hooks/hooks'
import { getPlugins } from './logic/logic'
import { createStore } from './store'

import type { HookConfig } from './remind.types'
import type { ActionsCreator, Selector, Patch, SetConfig } from './store.types'
import type { ArrowFunction } from './types/types'

const remind = <
  TState extends Record<PropertyKey, unknown>,
  TActions extends Record<PropertyKey, ArrowFunction>
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

    assert(subscriber.current, 'subscriber.current is null')

    const savedSubscriber = subscriber.current
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
    store.setState(...params)
  }

  return { setMind, useRemind, subscribe: store.subscribe }
}

// eslint-disable-next-line import/no-default-export -- library export
export default remind
