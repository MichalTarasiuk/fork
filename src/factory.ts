import { create } from 'src/vanilla'
import { useDidMount, useHistoryOf, useListener } from 'src/hooks'
import { merge } from 'src/utils'
import type { DeepPartial } from 'src/typings'

type Patch<TState> =
  | DeepPartial<TState>
  | ((prevState: TState) => DeepPartial<TState>)
type SetState<TState> = (patch: Patch<TState>, replace?: boolean) => void
type StateCreator<TState> = ((set: SetState<TState>) => TState) | TState
type Selector<TState> = (state: TState) => any

const factory = <TState>(stateCreator: StateCreator<TState>) => {
  const store = create(stateCreator)
  const hook = (selector?: Selector<TState>) => {
    const [state, listener] = useListener(store.get.state)
    const history = useHistoryOf(state)

    useDidMount(() => {
      const subscriber = store.subscribe(listener, selector)

      return () => {
        subscriber.unsubscribe()
      }
    })

    const handler = {
      mind: state,
      setMind: store.setState,
      history,
    }

    return merge([state, store.setState, history] as const, handler)
  }

  const {
    destroy: destorySubscribers,
    reset: resetToInitialState,
    ...restStore
  } = store

  const handler = {
    init() {
      return {
        useRemind: hook,
        destory: this.destory,
        ...restStore,
      }
    },
    destory() {
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          'WARN - destroy store may have unexpected effects on your application'
        )
      }

      resetToInitialState()
      destorySubscribers()

      return {
        init: this.init,
      }
    },
  }

  return handler.init()
}

export { factory }
export type { Patch, Selector, StateCreator, SetState }
