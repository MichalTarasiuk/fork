import {
  createObserver,
  buildOf,
  resolveHookState,
  equals,
  isFunction,
} from 'src/utils'

type Patch<TState> =
  | DeepPartial<TState>
  | ((prevState: TState) => DeepPartial<TState>)
type SetState<TState> = (patch: Patch<TState>, replace?: boolean) => void
// FIXME
export type StateCreator<TState> = ((set: SetState<TState>) => TState) | TState
export type Selector<TState extends Record<string, any>> = (
  state: TState
) => TState[keyof TState]

const create = <TState>(stateCreator: StateCreator<TState>) => {
  let state: TState
  const observer = createObserver<TState>()
  type Listener = Parameters<typeof observer.subscribe>[0]

  const customListener = (listener: Listener, selector: Selector<TState>) => {
    return (state: TState, prevState?: TState) => {
      const newSlice = selector(state)

      if (prevState) {
        const oldSlice = selector(prevState)

        !equals(newSlice, oldSlice) && listener(state)
      }
    }
  }

  const subscribe = (listener: Listener, selector?: Selector<TState>) => {
    listener = selector ? customListener(listener, selector) : listener

    const subscriber = observer.subscribe(listener)

    return {
      unsubscribe: subscriber.unsubscribe,
    }
  }

  const setState: SetState<TState> = (patch, replace = false) => {
    patch = resolveHookState(patch, state)
    const prevState = { ...state }
    const newState = replace ? (patch as TState) : buildOf(state, patch)

    state = newState
    observer.notify(state, prevState)
  }

  const destroy = () => observer.destroy()

  state = isFunction(stateCreator) ? stateCreator(setState) : stateCreator

  return {
    get getState() {
      return state
    },
    get listeners() {
      return observer.listeners
    },
    setState,
    destroy,
    subscribe,
  }
}

export { create }
