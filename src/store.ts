import Produce from 'immer'
import { cloneDeep, isEqual } from 'lodash'

import { createSubject, resolve, empty } from './utils/utils'

import type {
  ActionsCreator,
  Selector,
  SetState,
  Equality,
  ResolvableState,
  SetConfig,
  Patch,
  Listener,
} from './store.types'
import type { PlainFunction, PlainObject } from './types/types'

const createStore = <
  TState extends PlainObject,
  TActions extends Record<PropertyKey, PlainFunction> | undefined = undefined,
  TActionsCreator extends ActionsCreator<TState, TActions> = ActionsCreator<
    TState,
    TActions
  >
>(
  initialState: TState,
  actionsCreator?: ActionsCreator<TState, TActions>
) => {
  const state = createState(initialState)
  const subject = createSubject<TState>()

  const customListener = <TSelector extends Selector<TState>>(
    listener: Listener<TState>,
    selector: TSelector,
    equality?: Equality<TState>
  ) => {
    return (state: TState, nextState: TState) => {
      const nextSlice = selector(nextState)
      const slice = selector(state)
      const notify = equality
        ? equality(slice, nextSlice)
        : !isEqual(slice, nextSlice)

      if (notify) {
        listener(state, nextState)
      }
    }
  }

  const subscribe = <TSelector extends Selector<TState>>(
    listener: Listener<TState>,
    selector?: TSelector,
    equality?: Equality<TState>
  ) => {
    const readydListener = selector
      ? customListener(listener, selector, equality)
      : listener
    const subscriber = subject.subscribe(readydListener)
    const customSetState = (patch: Patch<TState>, config?: SetConfig) => {
      setState(patch, config, subscriber.body)
    }

    const unsafeActionsCreator = actionsCreator as TActionsCreator
    const actions = resolve(unsafeActionsCreator, customSetState, getState)

    return { actions, ...subscriber }
  }

  const setState: SetState<TState> = (patch, config, emitter) => {
    const { replace = false, emitt = true } = config || {}

    const { oldState, nextState } = state.set((state) => {
      const updatedState = Produce(state, (draft) => {
        const resolvedPatch = resolve(patch, draft, setState)

        if (resolvedPatch) {
          Object.assign(replace ? empty(draft) : draft, resolvedPatch)
        }
      })

      return updatedState
    })

    if (!isEqual(oldState, nextState)) {
      subject.notify(oldState, nextState, emitt ? undefined : emitter)
    }
  }

  const getState = () => state.current

  return {
    state: state.current,
    notify: subject.notify,
    get listeners() {
      return subject.listeners
    },
    setState,
    subscribe,
  }
}

const createState = <TState extends PlainObject>(initialState: TState) => {
  const state = {
    current: initialState,
    set(resolvableState: ResolvableState<TState>) {
      const oldState = cloneDeep(state.current)
      const nextState = resolve(resolvableState, oldState)

      Object.assign(empty(state.current), nextState)

      return {
        oldState,
        nextState,
      }
    },
  }

  return state
}

export { createStore }
