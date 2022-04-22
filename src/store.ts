import produce from 'immer'

import { createObserver, resolve, equals, copy, empty } from './helpers/helpers'
import type { Listener } from './helpers/helpers'
import type {
  CreateState,
  ActionsCreator,
  Selector,
  SetState,
  Equality,
  ResolvableState,
  SetConfig,
  Patch,
} from './store.types'

const createStore = <
  TState extends Record<PropertyKey, unknown>,
  TActions extends Record<PropertyKey, Function>
>(
  initialState: TState,
  actionsCreator: ActionsCreator<TState, TActions>
) => {
  let state: ReturnType<CreateState<TState>>
  const observer = createObserver<TState>()

  const customListener = <TSelector extends Selector<TState>>(
    listener: Listener<TState>,
    selector: Selector<TState>,
    equality?: Equality<ReturnType<TSelector>>
  ) => {
    return (state: TState, nextState: TState) => {
      const nextSlice = selector(nextState)
      const slice = selector(state)
      const notify = equality
        ? equality(slice, nextSlice)
        : !equals(slice, nextSlice)

      if (notify) {
        listener(state, nextState)
      }
    }
  }

  const subscribe = <TSelector extends Selector<TState>>(
    listener: Listener<TState>,
    selector?: TSelector,
    equality?: Equality<ReturnType<TSelector>>
  ) => {
    const readydListener = selector
      ? customListener(listener, selector, equality)
      : listener
    const subscriber = observer.subscribe(readydListener)
    const customSetState = (patch: Patch<TState>, config?: SetConfig) => {
      setState(patch, config, subscriber.body)
    }
    const actions = resolve(actionsCreator, customSetState, getState)

    return { actions, ...subscriber }
  }

  const setState: SetState<TState> = (patch, config, emitter) => {
    const { replace = false, emitt = true } = config || {}

    const { oldState, nextState } = state.set((state) => {
      const updatedState = produce(state, (draft) => {
        const resolvedPatch = resolve(patch, draft, setState)

        if (resolvedPatch) {
          Object.assign(replace ? empty(draft) : draft, resolvedPatch)
        }
      })

      return updatedState
    })

    if (!equals(oldState, nextState)) {
      observer.notify(oldState, nextState, emitt ? undefined : emitter)
    }
  }

  const getState = () => state.current

  state = createState(initialState)

  return {
    get listeners() {
      return observer.listeners
    },
    notify: observer.notify,
    setState,
    subscribe,
  }
}

const createState = <TState extends Record<PropertyKey, unknown>>(
  initialState: TState
) => ({
  current: initialState as TState,
  set(resolvableState: ResolvableState<TState>) {
    const oldState = copy(this.current)
    const nextState = resolve(resolvableState, oldState)

    Object.assign(empty(this.current), nextState)

    return {
      oldState,
      nextState,
    }
  },
})

export { createStore }
