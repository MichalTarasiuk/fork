import { useCallback, useRef } from 'react'

import { useFirstMount, useListener, useUnmount } from './hooks/hooks'
import { createHookControl } from './logic/logic'
import { createStore } from './store'
import { filterObject, compose } from './utils/utils'

import type { GlobalConfig, HookConfig } from './factory.types'
import type { ActionsCreator, Selector, Patch, SetConfig } from './store.types'
import type { ArrowFunction } from './types/types'

const factory = <
  TState extends Record<PropertyKey, unknown>,
  TActions extends Record<PropertyKey, ArrowFunction>,
  TContext extends Record<PropertyKey, unknown>
>(
  initialState: TState,
  actionsCreator?: ActionsCreator<TState, TActions>,
  globalConfig?: GlobalConfig<TState, TContext>
) => {
  const store = createStore(initialState, actionsCreator)
  const {
    Provider,
    safeHookCall,
    pluginsManager,
    errorReporter: { errors, setErrors, resetErrors },
  } = createHookControl(store)

  const useFork = <
    TSelector extends Selector<TState>,
    TConfig extends HookConfig<TState, TSelector> = Record<string, unknown>
  >(
    selector?: TSelector,
    hookConfig?: TConfig
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
        hookConfig?.equality
      )
    }

    const actions = subscriber.current?.actions
    const [state, listenerImpl] = useListener(initialState, actions, {
      beforeListen: (nextState) => {
        if (globalConfig) {
          const { resolver, context } = globalConfig
          const { state: patch, errors } = resolver(nextState, context)

          if (Object.values(errors).some(Boolean)) {
            const filteredPatch = filterObject(
              patch,
              (key) => key in errors && Boolean(errors[key])
            )
            const resolvedState = Object.assign({}, nextState, filteredPatch)

            store.setState(resolvedState)
            setErrors(errors)

            return false
          }
        }

        return true
      },
      onListen: (nextState) => {
        if (hookConfig) {
          const filteredPlugins = filterObject(
            pluginsManager.plugins,
            // @ts-ignore
            (key) => key in hookConfig && hookConfig[key] === true
          )
          const pickedPlugins = Object.values(filteredPlugins)
          const combinedPlugins = compose(...pickedPlugins)

          return combinedPlugins(nextState)
        }

        return nextState
      },
    })

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
      resetErrors()
    }, [])

    return {
      state,
      setState,
      errors,
    }
  }

  return {
    ForkProvider: Provider,
    useFork: safeHookCall(useFork),
    setState: store.setState,
    subscribe: store.subscribe,
  }
}

export { factory }
