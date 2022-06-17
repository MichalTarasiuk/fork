import { useCallback, useRef, useMemo } from 'react'

import { useFirstMount, useListener, useUnmount } from './hooks/hooks'
import { createHookControl, createErrorReporter } from './logic/logic'
import { createStore } from './store'
import { filterObject, compose, keyInObject } from './utils/utils'

import type { GlobalConfig, LocalConfig } from './factory.types'
import type { ActionsCreator, Selector, Patch, SetConfig } from './store.types'
import type { PlainFunction, PlainObject } from './types/types'

const factory = <
  TState extends PlainObject,
  TActions extends Record<PropertyKey, PlainFunction>,
  TContext extends PlainObject | undefined = undefined
>(
  initialState: TState,
  actionsCreator?: ActionsCreator<TState, TActions>,
  globalConfig?: GlobalConfig<TState, TContext>
) => {
  const store = createStore(initialState, actionsCreator)
  const { Provider, safeHookCall, pluginsControl } = createHookControl(store)

  const useFork = <TSelector extends Selector<TState>>(
    selector?: TSelector,
    localConfig?: LocalConfig<TState, TSelector>
  ) => {
    const subscriber = useRef<ReturnType<typeof store['subscribe']> | null>(
      null
    )
    const listener = useRef((_: TState, __: TState) => {})

    const isFirstMount = useFirstMount()
    const errorReporter = useMemo(() => createErrorReporter(store.state), [])

    if (isFirstMount) {
      subscriber.current = store.subscribe(
        (state, nextState) => listener.current(state, nextState),
        selector,
        localConfig?.equality
      )
    }

    const actions = subscriber.current?.actions
    const [state, listenerImpl] = useListener(initialState, actions, {
      beforeListen: (nextState) => {
        if (globalConfig) {
          const { resolver, context } = globalConfig
          const { state: fallbackPatch, errors } = resolver(nextState, context)

          if (Object.values(errors).some(Boolean)) {
            const resolvedPatch = filterObject(
              fallbackPatch,
              (key) => key in errors && Boolean(errors[key])
            )
            const resolvedState = Object.assign({}, nextState, resolvedPatch)

            store.setState(resolvedState)
            errorReporter.setErrors(errors)

            return false
          }
        }

        errorReporter.resetErrors()

        return true
      },
      onListen: (nextState) => {
        if (localConfig) {
          const filteredPlugins = filterObject(
            pluginsControl.plugins,
            (key) => keyInObject(localConfig, key) && localConfig[key] === true
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
    }, [])

    return {
      state,
      setState,
      errors: errorReporter.errors,
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
